// Content script for YouTube pages
// Runs on all YouTube pages to provide additional blocking

(function() {
  'use strict';
  
  /**
   * Check if focus mode is active
   */
  async function checkFocusMode() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getFocusStatus' }, (response) => {
        resolve(response?.active || false);
      });
    });
  }
  
  /**
   * Hide YouTube homepage recommendations
   */
  function hideYouTubeRecommendations() {
    // Hide homepage feed
    const feed = document.querySelector('#contents.ytd-rich-grid-renderer');
    if (feed) {
      feed.style.display = 'none';
    }
    
    // Hide sidebar recommendations
    const sidebar = document.querySelector('#related');
    if (sidebar) {
      sidebar.style.display = 'none';
    }
    
    // Hide shorts shelf
    const shorts = document.querySelectorAll('ytd-reel-shelf-renderer');
    shorts.forEach(el => el.style.display = 'none');
  }
  
  /**
   * Show focus mode overlay on YouTube
   */
  function showFocusOverlay() {
    // Check if overlay already exists
    if (document.getElementById('focus-mode-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'focus-mode-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      z-index: 10000;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    overlay.innerHTML = `
      🎯 Focus Mode Active - Only educational content allowed
    `;
    
    document.body.appendChild(overlay);
  }
  
  /**
   * Remove focus overlay
   */
  function removeFocusOverlay() {
    const overlay = document.getElementById('focus-mode-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
  
  /**
   * Initialize content script
   */
  async function init() {
    const isActive = await checkFocusMode();
    
    if (isActive) {
      // Show overlay
      showFocusOverlay();
      
      // Hide recommendations on homepage
      if (window.location.pathname === '/' || window.location.pathname === '') {
        hideYouTubeRecommendations();
      }
      
      // Monitor for dynamic content
      const observer = new MutationObserver(() => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
          hideYouTubeRecommendations();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      removeFocusOverlay();
    }
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Listen for focus mode changes
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'focusModeChanged') {
      init();
    }
  });
})();
