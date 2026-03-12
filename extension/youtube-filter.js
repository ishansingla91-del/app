(() => {
  "use strict";

  const host = window.location.hostname.toLowerCase();
  if (!(host === "youtube.com" || host.endsWith(".youtube.com"))) return;
  if (window.__focusGuardianYouTubeFilterLoaded) return;
  window.__focusGuardianYouTubeFilterLoaded = true;

  const CARD_SELECTORS = [
    "ytd-video-renderer",
    "ytd-rich-item-renderer",
    "ytd-compact-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-playlist-video-renderer",
    "ytd-rich-grid-media"
  ];
  const CARD_SELECTOR_STRING = CARD_SELECTORS.join(",");

  const DISTRACTION_SELECTORS = [
    "ytd-comments",
    "#comments",
    "ytd-watch-next-secondary-results-renderer",
    "#related",
    "ytd-reel-shelf-renderer",
    "ytd-rich-shelf-renderer[is-shorts]",
    "a[href^='/shorts']",
    "a[title='Shorts']",
    ".ytp-ce-element",
    ".ytp-endscreen-content",
    ".ytp-upnext",
    ".ytp-autonav-endscreen-upnext-container",
    "ytd-compact-autoplay-renderer"
  ];

  const state = {
    threshold: 2,
    minDurationSeconds: 6 * 60,
    trustedChannels: new Set(),
    titlePositive: [],
    descriptionPositive: [],
    negativeTitle: [],
    entertainmentChannels: [],
    playlistWhitelist: new Set(),
    observer: null,
    scanQueued: false,
    lastUrl: window.location.href,
    fingerprintByCard: new WeakMap(),
    educationalQueryTokens: [
      "jee",
      "neet",
      "physics",
      "chemistry",
      "biology",
      "math",
      "mathematics",
      "lecture",
      "tutorial",
      "ncert",
      "revision",
      "pyq",
      "class",
      "course"
    ],
    hardNegativeTokens: [
      "movie",
      "full movie",
      "trailer",
      "teaser",
      "song",
      "music video",
      "web series",
      "episode",
      "comedy",
      "standup",
      "live concert",
      "bgm",
      "dance"
    ]
  };

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function containsAny(text, tokens) {
    const sample = normalize(text);
    return tokens.some((token) => sample.includes(normalize(token)));
  }

  function parseDurationToSeconds(rawDuration) {
    if (!rawDuration) return 0;
    const normalized = String(rawDuration).replace(/[^\d:]/g, "");
    const parts = normalized.split(":").map((v) => Number(v));
    if (!parts.length || parts.some((v) => Number.isNaN(v))) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0];
  }

  function getText(root, selectors) {
    for (const selector of selectors) {
      const node = root.querySelector(selector);
      const text = node?.textContent?.trim();
      if (text) return text;
    }
    return "";
  }

  function parseUrl(raw) {
    try {
      return new URL(raw, window.location.origin);
    } catch {
      return null;
    }
  }

  function hideNode(node) {
    if (!(node instanceof HTMLElement)) return;
    node.style.setProperty("display", "none", "important");
    node.setAttribute("data-fg-blocked", "1");
  }

  function hasEducationalIntentQuery() {
    const url = parseUrl(window.location.href);
    if (!url) return true;
    if (!url.pathname.startsWith("/results")) return true;
    const q = normalize(url.searchParams.get("search_query") || "");
    if (!q) return false;
    return state.educationalQueryTokens.some((token) => q.includes(token));
  }

  function scoreVideo(meta) {
    const titleNorm = normalize(meta.title);
    const descNorm = normalize(meta.description);
    const channelNorm = normalize(meta.channelName);

    if (
      state.hardNegativeTokens.some((t) => titleNorm.includes(t) || descNorm.includes(t)) ||
      titleNorm.includes("#shorts")
    ) {
      return { score: -100, allowed: false };
    }

    let score = 0;
    const trusted = state.trustedChannels.has(channelNorm);

    if (trusted) score += 10;
    if (containsAny(meta.title, state.titlePositive)) score += 4;
    if (containsAny(meta.description, state.descriptionPositive)) score += 3;
    if (meta.durationSeconds >= state.minDurationSeconds) score += 2;
    if (meta.playlistId && state.playlistWhitelist.has(normalize(meta.playlistId))) score += 3;

    if (meta.isShort) score -= 10;
    if (containsAny(meta.title, state.negativeTitle)) score -= 8;
    if (state.entertainmentChannels.some((x) => normalize(meta.channelName).includes(normalize(x)))) score -= 6;
    if (!trusted) score -= 2;

    // Keep legitimate educational results visible even when metadata is sparse.
    if (!meta.channelName && containsAny(meta.title, state.titlePositive)) {
      score += 2;
    }

    return {
      score,
      allowed: score >= state.threshold
    };
  }

  function extractCardMetadata(card) {
    const title = getText(card, ["#video-title", "a#video-title", "h3 a"]);
    const description = getText(card, ["#description-text", ".metadata-snippet-text"]);
    const channelName = getText(card, ["ytd-channel-name a", "#channel-name a"]);
    const durationText = getText(card, [
      "ytd-thumbnail-overlay-time-status-renderer span",
      ".badge-shape-wiz__text"
    ]);
    const link = card.querySelector("a#thumbnail[href], a#video-title[href]");
    const videoUrl = parseUrl(link?.getAttribute("href") || "");
    const isShort =
      Boolean(videoUrl?.pathname?.startsWith("/shorts")) || card.querySelector("a[href*='/shorts/']") !== null;

    return {
      title,
      description,
      channelName,
      durationSeconds: parseDurationToSeconds(durationText),
      playlistId: videoUrl?.searchParams?.get("list") || "",
      isShort
    };
  }

  function processCard(card) {
    const meta = extractCardMetadata(card);
    if (!meta.title) return;

    const fp = `${normalize(meta.title)}|${normalize(meta.channelName)}|${meta.durationSeconds}|${meta.playlistId}`;
    if (state.fingerprintByCard.get(card) === fp) return;
    state.fingerprintByCard.set(card, fp);

    const result = scoreVideo(meta);
    if (!result.allowed) {
      hideNode(card);
    } else {
      card.style.removeProperty("display");
      card.removeAttribute("data-fg-blocked");
    }
  }

  function scanCards(root = document) {
    root.querySelectorAll?.(CARD_SELECTOR_STRING).forEach((card) => processCard(card));
  }

  function hideDistractingSections(root = document) {
    DISTRACTION_SELECTORS.forEach((selector) => {
      root.querySelectorAll(selector).forEach((node) => hideNode(node));
    });
  }

  function blockHomeFeed() {
    if (window.location.pathname !== "/") return;
    // Home is now allowed, but cards are still filtered by educational scoring.
    document.getElementById("fg-home-panel")?.remove();
  }

  function enforceSearchIntentGate() {
    if (!window.location.pathname.startsWith("/results")) return false;
    if (hasEducationalIntentQuery()) return false;

    document.getElementById("fg-search-intent-panel")?.remove();
    window.location.replace(chrome.runtime.getURL("block.html?source=youtube-search&reason=non-educational-query"));
    return true;
  }

  function enforceRouteRestrictions() {
    const path = window.location.pathname;
    if (
      path.startsWith("/shorts") ||
      path.startsWith("/feed/trending") ||
      path.startsWith("/feed/explore") ||
      path.startsWith("/feed/store")
    ) {
      window.location.replace(chrome.runtime.getURL("block.html?source=youtube&reason=blocked-route"));
      return true;
    }
    return false;
  }

  function evaluateWatchPage() {
    if (window.location.pathname !== "/watch") return;
    const pageTitleFallback = normalize(document.title).replace(/\s*-\s*youtube\s*$/i, "");
    const meta = {
      title: getText(document, ["h1.ytd-watch-metadata yt-formatted-string", "h1.title"]),
      description: getText(document, ["#description-inline-expander", "#description"]),
      channelName: getText(document, ["#owner-name a", "ytd-channel-name #text a"]),
      durationSeconds: parseDurationToSeconds(getText(document, [".ytp-time-duration"])),
      playlistId: parseUrl(window.location.href)?.searchParams?.get("list") || "",
      isShort: false
    };

    if (!meta.title && pageTitleFallback) meta.title = pageTitleFallback;
    if (!meta.title) return;

    const result = scoreVideo(meta);
    if (!result.allowed) {
      chrome.runtime
        .sendMessage({ type: "VIOLATION_DETECTED", reason: "non_educational_watch_video" })
        .catch((error) => {
          console.warn("Failed to report violation:", error);
        });
      window.location.replace(chrome.runtime.getURL("block.html?source=youtube-watch&reason=score-block"));
    }
  }

  function runEnforcement() {
    if (enforceRouteRestrictions()) return;
    if (enforceSearchIntentGate()) return;
    hideDistractingSections(document);
    blockHomeFeed();
    scanCards(document);
    evaluateWatchPage();
  }

  function queueEnforcement() {
    if (state.scanQueued) return;
    state.scanQueued = true;
    setTimeout(() => {
      state.scanQueued = false;
      runEnforcement();
    }, 120);
  }

  function startObserver() {
    if (state.observer) return;
    state.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList" || mutation.addedNodes.length === 0) continue;
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(CARD_SELECTOR_STRING) || node.querySelector(CARD_SELECTOR_STRING)) {
            queueEnforcement();
            return;
          }
        }
      }
    });
    state.observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  async function loadDictionaries() {
    try {
      const [keywordsRes, channelsRes, sessionRes] = await Promise.all([
        fetch(chrome.runtime.getURL("keywords.json")),
        fetch(chrome.runtime.getURL("channels.json")),
        chrome.runtime.sendMessage({ type: "fg.getSession" })
      ]);

      if (keywordsRes.ok) {
        const k = await keywordsRes.json();
        state.titlePositive = Array.isArray(k.titlePositive) ? k.titlePositive : [];
        state.descriptionPositive = Array.isArray(k.descriptionPositive) ? k.descriptionPositive : [];
        state.negativeTitle = Array.isArray(k.negativeTitle) ? k.negativeTitle : [];
        state.entertainmentChannels = Array.isArray(k.entertainmentChannels) ? k.entertainmentChannels : [];
        state.playlistWhitelist = new Set(
          (Array.isArray(k.playlistWhitelist) ? k.playlistWhitelist : []).map((x) => normalize(x))
        );
      }

      if (channelsRes.ok) {
        const c = await channelsRes.json();
        const set = new Set();
        (Array.isArray(c.trustedChannels) ? c.trustedChannels : []).forEach((entry) => {
          if (typeof entry === "string") set.add(normalize(entry));
          if (entry && typeof entry === "object") {
            if (entry.name) set.add(normalize(entry.name));
            if (Array.isArray(entry.aliases)) entry.aliases.forEach((a) => set.add(normalize(a)));
          }
        });
        state.trustedChannels = set;
      }

      if (sessionRes?.ok) {
        const threshold = Number(sessionRes?.config?.youtubeThresholdScore);
        if (!Number.isNaN(threshold) && threshold >= 1) state.threshold = threshold;
      }
    } catch {
      // Defaults remain.
    }
  }

  function hookNavigation() {
    window.addEventListener("yt-navigate-finish", () => {
      state.lastUrl = window.location.href;
      queueEnforcement();
    });
    window.addEventListener("popstate", queueEnforcement);
    setInterval(() => {
      if (window.location.href !== state.lastUrl) {
        state.lastUrl = window.location.href;
        queueEnforcement();
      }
    }, 700);
  }

  function blockDistractingClicks() {
    document.addEventListener(
      "click",
      (event) => {
        const link = event.target?.closest?.("a[href]");
        if (!link) return;
        const href = link.getAttribute("href") || "";
        const full = parseUrl(href);
        if (!full) return;

        const path = full.pathname || "";
        if (path.startsWith("/shorts") || path.startsWith("/feed/trending") || path.startsWith("/feed/explore")) {
          event.preventDefault();
          event.stopPropagation();
          window.location.replace(chrome.runtime.getURL("block.html?source=youtube&reason=blocked-click"));
        }
      },
      true
    );
  }

  async function init() {
    // Cleanup any stale overlay panel injected by older builds.
    document.getElementById("fg-search-intent-panel")?.remove();
    document.getElementById("fg-home-panel")?.remove();
    await loadDictionaries();
    runEnforcement();
    startObserver();
    hookNavigation();
    blockDistractingClicks();
    setInterval(queueEnforcement, 5000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => void init(), { once: true });
  } else {
    void init();
  }
})();
