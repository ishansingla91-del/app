(() => {
  "use strict";

  if (window.__focusGuardianContentLoaded) return;
  window.__focusGuardianContentLoaded = true;

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

  const KEEP_ALIVE_INTERVAL_MS = 12000;
  const ENFORCE_DEBOUNCE_MS = 400;

  let keepAliveIntervalId = null;
  let lastKnownUrl = window.location.href;
  let enforceTimer = null;

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function isBlockedHostname(hostname) {
    const host = normalize(hostname);
    return BLOCKED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  }

  function buildBlockUrl(reason = "blocked-domain") {
    const params = new URLSearchParams({
      source: window.location.hostname,
      reason
    });
    return chrome.runtime.getURL(`block.html?${params.toString()}`);
  }

  async function getSessionState() {
    try {
      const response = await chrome.runtime.sendMessage({ type: "fg.getSession" });
      if (!response?.ok) return null;
      return response.session || null;
    } catch {
      return null;
    }
  }

  function hardLockPage(reason = "blocked-domain") {
    if (window.location.href.startsWith(chrome.runtime.getURL("block.html"))) {
      return;
    }

    const overlayId = "fg-hard-lock-overlay";
    if (document.getElementById(overlayId)) return;

    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.innerHTML = `
      <div style="
        max-width:640px;
        padding:32px;
        border-radius:20px;
        background:#0f172a;
        color:#e5e7eb;
        box-shadow:0 20px 60px rgba(0,0,0,0.45);
        font-family:Segoe UI, Arial, sans-serif;
        text-align:center;
      ">
        <h1 style="margin:0 0 12px 0;font-size:32px;">Focus Mode Active</h1>
        <p style="margin:0;font-size:18px;line-height:1.5;">
          Distracting content is blocked. Redirecting you back to study mode.
        </p>
        <p style="margin:14px 0 0 0;font-size:13px;opacity:0.75;">
          Reason: ${reason}
        </p>
      </div>
    `;

    overlay.style.cssText = `
      position:fixed;
      inset:0;
      z-index:2147483647;
      display:flex;
      align-items:center;
      justify-content:center;
      background:rgba(2,6,23,0.96);
      pointer-events:all;
    `;

    document.documentElement.style.setProperty("overflow", "hidden", "important");
    document.body?.style?.setProperty("overflow", "hidden", "important");

    document.documentElement.appendChild(overlay);
  }

  async function enforceFallbackBlockPage(reason = "blocked-domain") {
    if (!isBlockedHostname(window.location.hostname)) return;
    if (window.location.href.startsWith(chrome.runtime.getURL("block.html"))) return;

    const session = await getSessionState();
    if (!session?.active) return;

    hardLockPage(reason);

    setTimeout(() => {
      window.location.replace(buildBlockUrl(reason));
    }, 100);
  }

  function debounceEnforce(reason = "blocked-domain") {
    clearTimeout(enforceTimer);
    enforceTimer = setTimeout(() => {
      void enforceFallbackBlockPage(reason);
    }, ENFORCE_DEBOUNCE_MS);
  }

  async function sendKeepAlive() {
    try {
      await chrome.runtime.sendMessage({
        type: "fg.keepAlive",
        url: window.location.href,
        title: document.title
      });
    } catch {
      // Ignore temporary service worker sleep/reload failures.
    }
  }

  function startKeepAliveLoop() {
    if (keepAliveIntervalId) return;

    void sendKeepAlive();
    keepAliveIntervalId = window.setInterval(() => {
      void sendKeepAlive();
    }, KEEP_ALIVE_INTERVAL_MS);
  }

  function watchUrlChanges() {
    const checkUrl = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastKnownUrl) {
        lastKnownUrl = currentUrl;
        debounceEnforce("dynamic-navigation");
        void sendKeepAlive();
      }
    };

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      checkUrl();
      return result;
    };

    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      checkUrl();
      return result;
    };

    window.addEventListener("popstate", checkUrl);
    window.addEventListener("hashchange", checkUrl);

    setInterval(checkUrl, 1000);
  }

  function bindActivityChecks() {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        debounceEnforce("visibility-return");
        void sendKeepAlive();
      }
    });

    window.addEventListener("focus", () => {
      debounceEnforce("window-focus");
      void sendKeepAlive();
    });

    document.addEventListener(
      "click",
      () => {
        if (isBlockedHostname(window.location.hostname)) {
          debounceEnforce("interaction-on-blocked-site");
        }
      },
      true
    );
  }

  function bindSessionUpdates() {
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (sender.id !== chrome.runtime.id) return;
      if (message?.type === "fg.sessionUpdated") {
        debounceEnforce("session-updated");
      }
    });
  }

  function boot() {
    void enforceFallbackBlockPage("initial-load");
    startKeepAliveLoop();
    watchUrlChanges();
    bindActivityChecks();
    bindSessionUpdates();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
