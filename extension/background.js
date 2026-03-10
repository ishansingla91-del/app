const API_BASE = "http://localhost:5000";

async function getExtensionStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/extension/status`);
    if (!res.ok) throw new Error("status fetch failed");
    return await res.json();
  } catch (error) {
    return {
      focus: { active: false },
      blocked: [],
      blocklistVersion: 0,
    };
  }
}

function isBlockedHost(hostname, blocked) {
  const lower = hostname.toLowerCase();
  return blocked.some((domain) => lower === domain || lower.endsWith(`.${domain}`));
}

async function shouldBlockUrl(url) {
  try {
    const parsed = new URL(url);
    const status = await getExtensionStatus();

    if (!status?.focus?.active) return false;
    return isBlockedHost(parsed.hostname, status.blocked || []);
  } catch (e) {
    return false;
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "loading" || !tab.url) return;

  const block = await shouldBlockUrl(tab.url);
  if (!block) return;

  const targetUrl = chrome.runtime.getURL("block.html") + `?url=${encodeURIComponent(tab.url)}`;
  chrome.tabs.update(tabId, { url: targetUrl });
});
