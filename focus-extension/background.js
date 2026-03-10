// Import utilities
importScripts('utils/blocklist.js', 'utils/api.js', 'utils/youtube.js');

// Extension state
let focusMode = {
  active: false,
  endsAt: null,
  lastCheck: null
};

// Constants
const SYNC_INTERVAL = 10000; // 10 seconds
const BLOCKED_PAGE_URL = chrome.runtime.getURL('blocked/blocked.html');

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('Study Planner AI Focus Extension installed');
  
  // Initialize storage
  chrome.storage.local.set({
    focusMode: false,
    endsAt: null
  });
  
  // Start sync alarm
  chrome.alarms.create('syncFocusStatus', {
    periodInMinutes: SYNC_INTERVAL / 60000
  });
  
  // Initial sync
  syncFocusStatus();
});

/**
 * Sync focus status with backend
 */
async function syncFocusStatus() {
  try {
    const status = await getFocusStatus();
    
    const previousState = focusMode.active;
    focusMode.active = status.active;
    focusMode.endsAt = status.endsAt;
    focusMode.lastCheck = Date.now();
    
    // Save to storage
    await chrome.storage.local.set({
      focusMode: status.active,
      endsAt: status.endsAt
    });
    
    // Log state change
    if (previousState !== status.active) {
      console.log(`Focus mode ${status.active ? 'ACTIVATED' : 'DEACTIVATED'}`);
      
      // Update badge
      updateBadge(status.active);
      
      // If deactivated, clear YouTube cache
      if (!status.active) {
        clearCache();
      }
    }
  } catch (error) {
    console.error('Error syncing focus status:', error);
  }
}

/**
 * Update extension badge
 * @param {boolean} active - Focus mode status
 */
function updateBadge(active) {
  if (active) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Green
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

/**
 * Handle alarm events
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncFocusStatus') {
    syncFocusStatus();
  }
});

/**
 * Check if URL should be blocked
 * @param {string} url - URL to check
 * @returns {boolean} - True if should be blocked
 */
function shouldBlockUrl(url) {
  if (!focusMode.active) return false;
  
  // Check regular blocked domains
  if (isBlocked(url)) {
    return true;
  }
  
  // Check YouTube blocked paths
  if (isYouTubePathBlocked(url)) {
    return true;
  }
  
  return false;
}

/**
 * Handle web navigation events
 */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only handle main frame navigations
  if (details.frameId !== 0) return;
  
  const url = details.url;
  
  // Skip chrome:// and extension URLs
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Check if should block
  if (shouldBlockUrl(url)) {
    console.log('Blocking URL:', url);
    chrome.tabs.update(details.tabId, {
      url: BLOCKED_PAGE_URL + '?blocked=' + encodeURIComponent(url)
    });
    return;
  }
  
  // Handle YouTube videos separately
  if (isYouTubeVideo(url)) {
    if (!focusMode.active) return;
    
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return;
    
    // Check cache first
    const cached = getCachedVideo(videoId);
    if (cached !== null) {
      if (!cached.allowed) {
        console.log('Blocking cached YouTube video:', videoId);
        chrome.tabs.update(details.tabId, {
          url: BLOCKED_PAGE_URL + '?youtube=' + videoId
        });
      }
      return;
    }
    
    // Verify with backend
    const result = await verifyYouTubeVideo(videoId);
    cacheVideo(videoId, result);
    
    if (!result.allowed) {
      console.log('Blocking YouTube video:', videoId, result.reason);
      chrome.tabs.update(details.tabId, {
        url: BLOCKED_PAGE_URL + '?youtube=' + videoId + '&reason=' + encodeURIComponent(result.reason)
      });
    } else {
      console.log('Allowing educational YouTube video:', videoId);
    }
  }
});

/**
 * Handle messages from popup and content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getFocusStatus') {
    sendResponse({
      active: focusMode.active,
      endsAt: focusMode.endsAt
    });
  } else if (request.action === 'syncNow') {
    syncFocusStatus().then(() => {
      sendResponse({
        active: focusMode.active,
        endsAt: focusMode.endsAt
      });
    });
    return true; // Keep channel open for async response
  }
});

// Start initial sync
syncFocusStatus();
