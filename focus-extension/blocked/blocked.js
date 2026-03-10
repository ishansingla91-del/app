// Blocked page script

// Motivational quotes
const QUOTES = [
  "Stay focused. Your future self will thank you.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The secret of getting ahead is getting started.",
  "Focus on being productive instead of busy.",
  "Your limitation—it's only your imagination.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Don't wait for opportunity. Create it."
];

// DOM elements
const quoteElement = document.getElementById('quote');
const timeRemainingElement = document.getElementById('timeRemaining');
const blockedUrlElement = document.getElementById('blockedUrl');
const dashboardBtn = document.getElementById('dashboardBtn');

const DASHBOARD_URL = 'http://localhost:5000'; // Change to your production URL

/**
 * Get random motivational quote
 * @returns {string} - Random quote
 */
function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

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
  
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Update time display
 */
function updateTime() {
  chrome.storage.local.get(['endsAt'], (result) => {
    if (result.endsAt) {
      timeRemainingElement.textContent = formatTimeRemaining(result.endsAt);
      
      // Check if session ended
      const now = new Date();
      const end = new Date(result.endsAt);
      if (now >= end) {
        // Session ended, redirect to dashboard
        window.location.href = DASHBOARD_URL;
      }
    }
  });
}

/**
 * Initialize blocked page
 */
function init() {
  // Set random quote
  quoteElement.textContent = getRandomQuote();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const blockedUrl = urlParams.get('blocked') || urlParams.get('youtube');
  const reason = urlParams.get('reason');
  
  // Display blocked URL
  if (blockedUrl) {
    blockedUrlElement.textContent = decodeURIComponent(blockedUrl);
  }
  
  // Update subtitle if YouTube video
  if (urlParams.has('youtube')) {
    const subtitle = document.querySelector('.subtitle');
    if (reason) {
      subtitle.textContent = decodeURIComponent(reason);
    } else {
      subtitle.textContent = 'This YouTube video is not educational enough for focus mode';
    }
  }
  
  // Update time remaining
  updateTime();
  
  // Update time every second
  setInterval(updateTime, 1000);
  
  // Dashboard button
  dashboardBtn.addEventListener('click', () => {
    window.location.href = DASHBOARD_URL;
  });
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
