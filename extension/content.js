const API_BASE = "http://localhost:5000";

async function getFocusStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/focus/status`);
    if (!res.ok) throw new Error("focus status failed");
    return await res.json();
  } catch (e) {
    return { active: false };
  }
}

async function classifyYoutubeTitle(title) {
  try {
    const res = await fetch(`${API_BASE}/api/youtube/classify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error("classification failed");
    return await res.json();
  } catch (e) {
    return { success: false, educational: true, score: 0 };
  }
}

function getYoutubeTitle() {
  const selectors = [
    "h1.ytd-watch-metadata",
    "yt-formatted-string.style-scope.ytd-watch-metadata",
    "meta[name='title']"
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (!el) continue;

    if (el.getAttribute && el.getAttribute("content")) {
      return el.getAttribute("content");
    }

    if (el.textContent) {
      return el.textContent.trim();
    }
  }

  return document.title.replace(" - YouTube", "").trim();
}

function showOverlay(message) {
  if (document.getElementById("focus-guard-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "focus-guard-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "999999";
  overlay.style.background = "rgba(0,0,0,0.95)";
  overlay.style.color = "white";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.fontFamily = "Arial, sans-serif";
  overlay.style.fontSize = "28px";
  overlay.style.textAlign = "center";
  overlay.style.padding = "32px";
  overlay.textContent = message;

  document.body.appendChild(overlay);
  document.documentElement.style.overflow = "hidden";
}

async function enforceYoutubeRules() {
  const focusStatus = await getFocusStatus();
  if (!focusStatus.active) return;

  const title = getYoutubeTitle();
  if (!title) return;

  const classification = await classifyYoutubeTitle(title);

  if (classification.success && !classification.educational) {
    showOverlay("Focus Mode is active. This YouTube video appears distracting and has been blocked.");
  }
}

setTimeout(enforceYoutubeRules, 2500);
window.addEventListener("yt-navigate-finish", () => {
  setTimeout(enforceYoutubeRules, 1500);
});
