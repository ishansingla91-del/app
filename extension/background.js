const STORAGE_KEYS = {
  session: "fg.session",
  config: "fg.config",
  violations: "fg.violations",
  lockState: "fg.lockState"
};

const RULESET_ID = "focus_blocking_rules";
const SESSION_ALARM = "fg.session.tick";
const RULE_GUARD_ALARM = "fg.rules.guard";

const BLOCKED_DOMAINS = [
  "instagram.com",
  "facebook.com",
  "reddit.com",
  "x.com",
  "twitter.com",
  "tiktok.com",
  "twitch.tv",
  "discord.com",
  "netflix.com",
  "primevideo.com"
];

const DEFAULT_CONFIG = {
  youtubeThresholdScore: 2,
  adminPinHash: "43f5c67c211fb0f6299da2872f593c88f5fc5ca8620af0e2ec9cd9987563e2f0", // 2580
  maxInvalidPinAttempts: 5,
  invalidPinLockMinutes: 15
};

const DEFAULT_SESSION = {
  active: true,
  goal: "Focused study session",
  startedAt: 0,
  endsAt: 0,
  durationMinutes: 720
};

function now() {
  return Date.now();
}

async function hashPin(pin) {
  const input = new TextEncoder().encode(String(pin || ""));
  const digest = await crypto.subtle.digest("SHA-256", input);
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function parseUrl(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function isBlockedUrl(url) {
  const parsed = parseUrl(url);
  if (!parsed) return false;
  const host = parsed.hostname.toLowerCase();
  return BLOCKED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}

function isBlockedRoute(url) {
  const parsed = parseUrl(url);
  if (!parsed) return false;
  if (!parsed.hostname.includes("youtube.com")) return false;
  return (
    parsed.pathname.startsWith("/shorts") ||
    parsed.pathname.startsWith("/feed/trending") ||
    parsed.pathname.startsWith("/feed/explore")
  );
}

function buildBlockUrl(source = "blocked", reason = "focus-mode") {
  const params = new URLSearchParams({ source, reason });
  return chrome.runtime.getURL(`block.html?${params.toString()}`);
}

async function getConfig() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.config);
  return { ...DEFAULT_CONFIG, ...(data[STORAGE_KEYS.config] || {}) };
}

async function getSession() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.session);
  return { ...DEFAULT_SESSION, ...(data[STORAGE_KEYS.session] || {}) };
}

async function getLockState() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.lockState);
  return data[STORAGE_KEYS.lockState] || { invalidPinAttempts: 0, lockedUntil: 0 };
}

async function setLockState(state) {
  await chrome.storage.local.set({ [STORAGE_KEYS.lockState]: state });
}

async function setSession(session) {
  await chrome.storage.local.set({ [STORAGE_KEYS.session]: session });
  await broadcastSession(session);
}

async function ensureSession() {
  const cfg = await getConfig();
  const session = await getSession();
  const current = now();
  if (!session.startedAt) {
    const boot = {
      ...session,
      active: true,
      startedAt: current,
      endsAt: current + 12 * 60 * 60 * 1000,
      durationMinutes: 720
    };
    await setSession(boot);
    await chrome.storage.local.set({ [STORAGE_KEYS.config]: cfg });
    return boot;
  }

  if (session.active && current >= session.endsAt) {
    const renewed = {
      ...session,
      startedAt: current,
      endsAt: current + 12 * 60 * 60 * 1000,
      durationMinutes: 720
    };
    await setSession(renewed);
    return renewed;
  }

  return session;
}

async function ensureRuleset(enabled = true) {
  const list = await chrome.declarativeNetRequest.getEnabledRulesets();
  const has = list.includes(RULESET_ID);
  if (enabled && !has) {
    await chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: [RULESET_ID] });
  }
  if (!enabled && has) {
    await chrome.declarativeNetRequest.updateEnabledRulesets({ disableRulesetIds: [RULESET_ID] });
  }
}

async function logViolation(reason, details = {}) {
  const data = await chrome.storage.local.get(STORAGE_KEYS.violations);
  const arr = Array.isArray(data[STORAGE_KEYS.violations]) ? data[STORAGE_KEYS.violations] : [];
  arr.unshift({ id: crypto.randomUUID(), reason, details, at: now() });
  await chrome.storage.local.set({ [STORAGE_KEYS.violations]: arr.slice(0, 500) });
}

async function broadcastSession(session) {
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs.map(
      (tab) =>
        new Promise((resolve) => {
          if (!tab.id) return resolve();
          chrome.tabs.sendMessage(tab.id, { type: "fg.sessionUpdated", session }, () => {
            // Ignore errors from tabs that don't have content script loaded
            resolve();
          });
        })
    )
  );
}

async function verifyPin(pin) {
  const lock = await getLockState();
  if (now() < Number(lock.lockedUntil || 0)) return false;
  const cfg = await getConfig();
  const incoming = await hashPin(pin);
  return incoming === cfg.adminPinHash;
}

async function endSession(pin, source = "manual") {
  const cfg = await getConfig();
  const lock = await getLockState();

  if (now() < Number(lock.lockedUntil || 0)) {
    return { ok: false, error: "Too many invalid PIN attempts. Try later." };
  }

  const valid = await verifyPin(pin);
  if (!valid) {
    const attempts = Number(lock.invalidPinAttempts || 0) + 1;
    let next = { ...lock, invalidPinAttempts: attempts };
    if (attempts >= cfg.maxInvalidPinAttempts) {
      next = {
        invalidPinAttempts: 0,
        lockedUntil: now() + cfg.invalidPinLockMinutes * 60 * 1000
      };
      await logViolation("pin_lockout_triggered", { source, lockMinutes: cfg.invalidPinLockMinutes });
    }
    await setLockState(next);
    await logViolation("invalid_pin_end_attempt", { source });
    return { ok: false, error: "Invalid admin PIN." };
  }

  await setLockState({ invalidPinAttempts: 0, lockedUntil: 0 });

  const session = await getSession();
  const ended = { ...session, active: false, endedAt: now() };
  await setSession(ended);
  await ensureRuleset(false);
  return { ok: true, session: ended };
}

async function updateFocusTime(pin, durationMinutes) {
  const lock = await getLockState();
  if (now() < Number(lock.lockedUntil || 0)) {
    return { ok: false, error: "PIN system is temporarily locked." };
  }

  const valid = await verifyPin(pin);
  if (!valid) {
    await logViolation("invalid_pin_duration_attempt", {});
    return { ok: false, error: "Invalid admin PIN." };
  }

  const minutes = Number(durationMinutes);
  if (!Number.isFinite(minutes)) {
    return { ok: false, error: "Duration must be a number." };
  }

  const clamped = Math.max(15, Math.min(720, Math.floor(minutes)));
  const session = await getSession();
  const updated = {
    ...session,
    active: true,
    startedAt: now(),
    durationMinutes: clamped,
    endsAt: now() + clamped * 60 * 1000
  };

  await setSession(updated);
  await ensureRuleset(true);
  await setLockState({ invalidPinAttempts: 0, lockedUntil: 0 });
  await logViolation("focus_time_updated", { durationMinutes: clamped });
  return { ok: true, session: updated };
}

async function changeAdminPin(currentPin, newPin) {
  const lock = await getLockState();
  if (now() < Number(lock.lockedUntil || 0)) {
    return { ok: false, error: "PIN system is temporarily locked." };
  }

  const currentOk = await verifyPin(currentPin);
  if (!currentOk) {
    await logViolation("invalid_pin_change_attempt", {});
    return { ok: false, error: "Current PIN is invalid." };
  }

  const cleaned = String(newPin || "").trim();
  if (!/^\d{4,8}$/.test(cleaned)) {
    return { ok: false, error: "New PIN must be 4-8 digits." };
  }

  const cfg = await getConfig();
  cfg.adminPinHash = await hashPin(cleaned);
  await chrome.storage.local.set({ [STORAGE_KEYS.config]: cfg });
  await setLockState({ invalidPinAttempts: 0, lockedUntil: 0 });
  await logViolation("admin_pin_changed", { at: now() });
  return { ok: true };
}

async function enforceTab(tabId, url) {
  const session = await ensureSession();
  if (!session.active) return;

  if (isBlockedUrl(url)) {
    const host = parseUrl(url)?.hostname || "blocked";
    await chrome.tabs.update(tabId, { url: buildBlockUrl(host, "blocked-domain") });
    await logViolation("blocked_domain_open_attempt", { url });
    return;
  }

  if (isBlockedRoute(url)) {
    await chrome.tabs.update(tabId, { url: buildBlockUrl("youtube", "blocked-route") });
    await logViolation("blocked_youtube_route_attempt", { url });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void (async () => {
    await ensureRuleset(true);
    await ensureSession();
    await chrome.alarms.create(SESSION_ALARM, { periodInMinutes: 1 });
    await chrome.alarms.create(RULE_GUARD_ALARM, { periodInMinutes: 1 });
  })();
});

chrome.runtime.onStartup.addListener(() => {
  void (async () => {
    await ensureRuleset(true);
    await ensureSession();
    await chrome.alarms.create(SESSION_ALARM, { periodInMinutes: 1 });
    await chrome.alarms.create(RULE_GUARD_ALARM, { periodInMinutes: 1 });
  })();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  void (async () => {
    if (alarm.name === SESSION_ALARM) {
      await ensureSession();
      return;
    }
    if (alarm.name === RULE_GUARD_ALARM) {
      const session = await getSession();
      await ensureRuleset(Boolean(session.active));
    }
  })();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    void enforceTab(tabId, changeInfo.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  void (async () => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab?.url) await enforceTab(activeInfo.tabId, tab.url);
  })();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void (async () => {
    const type = message?.type;
    if (type === "fg.getSession") {
      sendResponse({ ok: true, session: await ensureSession(), config: await getConfig() });
      return;
    }

    if (type === "fg.endSession") {
      const result = await endSession(message.pin || "", message.source || "manual");
      sendResponse(result);
      return;
    }

    if (type === "fg.getLockState") {
      sendResponse({ ok: true, lockState: await getLockState() });
      return;
    }

    if (type === "fg.changePin") {
      const result = await changeAdminPin(message.currentPin || "", message.newPin || "");
      sendResponse(result);
      return;
    }

    if (type === "fg.updateFocusTime") {
      const result = await updateFocusTime(message.pin || "", message.durationMinutes);
      sendResponse(result);
      return;
    }

    if (type === "fg.logViolation") {
      await logViolation(message.reason || "manual", message.details || {});
      sendResponse({ ok: true });
      return;
    }

    if (type === "fg.keepAlive") {
      const url = message.url || sender?.tab?.url || "";
      if (sender?.tab?.id && url) await enforceTab(sender.tab.id, url);
      sendResponse({ ok: true });
      return;
    }

    if (type === "VIOLATION_DETECTED") {
      const url = sender?.tab?.url || "";
      if (sender?.tab?.id) {
        await chrome.tabs.update(sender.tab.id, { url: buildBlockUrl("youtube", message.reason || "distraction") });
      }
      await logViolation("content_violation", { reason: message.reason || "distraction", url });
      sendResponse({ ok: true });
      return;
    }

    sendResponse({ ok: false, error: "Unknown message type." });
  })();
  return true;
});

void (async () => {
  await ensureSession();
  await ensureRuleset(true);
})();
