// Popup script
const DASHBOARD_URL = 'http://localhost:5000'; // Change to your production URL

// DOM elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const timeRemaining = document.getElementById('timeRemaining');
const timeText = document.getElementById('timeText');
const infoText = document.getElementById('infoText');
const dashboardBtn = document.getElementById('dashboardBtn');
const refreshBtn = document.getElementById('refreshBtn');

/**
 * Format time remaining
 * @param {string} endsAt - ISO timestamp
 * @returns {string} - Formatted time string
 */
function formatTimeRemaining(endsAt) {
  if (!endsAt) return '--:--';
  
  const now = new Date();
  const end = new Date(endsAt);
  const diff = end - now;
  
  if (diff <= 0) return '00:00';
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Update UI with focus status
 * @param {Object} status - Focus status object
 */
function updateUI(status) {
  if (status.active) {
    // Active state
    statusDot.className = 'status-dot active';
    statusText.textContent = 'Focus Mode Active';
    
    // Show time remaining
    timeRemaining.style.display = 'flex';
    timeText.textContent = formatTimeRemaining(status.endsAt);
    
    // Update info text
    infoText.textContent = 'Distracting websites are blocked. Stay focused on your studies!';
    infoText.className = 'info-text active';
    
    // Update time every second
    if (window.timeInterval) {
      clearInterval(window.timeInterval);
    }
    window.timeInterval = setInterval(() => {
      timeText.textContent = formatTimeRemaining(status.endsAt);
      
      // Check if session ended
      const now = new Date();
      const end = new Date(status.endsAt);
      if (now >= end) {
        clearInterval(window.timeInterval);
        loadStatus();
      }
    }, 1000);
  } else {
    // Inactive state
    statusDot.className = 'status-dot inactive';
    statusText.textContent = 'Focus Mode Inactive';
    
    // Hide time remaining
    timeRemaining.style.display = 'none';
    
    // Update info text
    infoText.textContent = 'Start a focus session in your dashboard to activate blocking.';
    infoText.className = 'info-text';
    
    // Clear interval
    if (window.timeInterval) {
      clearInterval(window.timeInterval);
    }
  }
}

/**
 * Load focus status from background script
 */
async function loadStatus() {
  try {
    chrome.runtime.sendMessage({ action: 'getFocusStatus' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        statusText.textContent = 'Error loading status';
        return;
      }
      
      updateUI(response);
    });
  } catch (error) {
    console.error('Error loading status:', error);
    statusText.textContent = 'Error loading status';
  }
}

/**
 * Refresh status from backend
 */
async function refreshStatus() {
  refreshBtn.disabled = true;
  refreshBtn.textContent = 'Refreshing...';
  
  try {
    chrome.runtime.sendMessage({ action: 'syncNow' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        return;
      }
      
      updateUI(response);
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.5 2V8H15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2.5 22V16H8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19.13 8C18.1 5.5 15.7 3.7 12.9 3.5C8.5 3.2 4.7 6.5 4.2 10.9C3.7 15.7 7.3 19.8 12 20C15.3 20.1 18.1 18.2 19.4 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Refresh Status
      `;
    });
  } catch (error) {
    console.error('Error refreshing:', error);
    refreshBtn.disabled = false;
  }
}

/**
 * Open dashboard in new tab
 */
function openDashboard() {
  chrome.tabs.create({ url: DASHBOARD_URL });
}

// Event listeners
dashboardBtn.addEventListener('click', openDashboard);
refreshBtn.addEventListener('click', refreshStatus);

// Load status on popup open
loadStatus();

// Cleanup on popup close
window.addEventListener('unload', () => {
  if (window.timeInterval) {
    clearInterval(window.timeInterval);
  }
});
