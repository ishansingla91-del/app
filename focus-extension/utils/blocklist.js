// Blocklist configuration
const BLOCKED_DOMAINS = {
  social: [
    'instagram.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'tiktok.com',
    'snapchat.com',
    'linkedin.com',
    'pinterest.com',
    'tumblr.com',
    'whatsapp.com'
  ],
  entertainment: [
    'netflix.com',
    'primevideo.com',
    'hotstar.com',
    'twitch.tv',
    'hulu.com',
    'disneyplus.com',
    'hbomax.com',
    'spotify.com',
    'soundcloud.com'
  ],
  distraction: [
    'reddit.com',
    'discord.com',
    '9gag.com',
    'buzzfeed.com',
    'imgur.com',
    'quora.com'
  ],
  gaming: [
    'poki.com',
    'crazygames.com',
    'store.steampowered.com',
    'epicgames.com',
    'roblox.com',
    'minecraft.net',
    'ea.com',
    'playstation.com',
    'xbox.com'
  ],
  adult: [
    // Add adult content domains here
    // Extension will block these automatically
  ],
  shopping: [
    'amazon.com',
    'ebay.com',
    'flipkart.com',
    'myntra.com',
    'ajio.com'
  ],
  news: [
    'cnn.com',
    'bbc.com',
    'news.google.com',
    'timesofindia.com',
    'hindustantimes.com'
  ]
};

// YouTube paths to block
const YOUTUBE_BLOCKED_PATHS = [
  '/shorts',
  '/trending',
  '/feed/explore',
  '/feed/trending'
];

/**
 * Check if a URL should be blocked
 * @param {string} url - The URL to check
 * @returns {boolean} - True if URL should be blocked
 */
function isBlocked(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    // Check all blocked domains
    for (const category in BLOCKED_DOMAINS) {
      for (const domain of BLOCKED_DOMAINS[category]) {
        if (hostname === domain || hostname.endsWith('.' + domain)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Check if YouTube path should be blocked
 * @param {string} url - The YouTube URL to check
 * @returns {boolean} - True if path should be blocked
 */
function isYouTubePathBlocked(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    if (hostname !== 'youtube.com' && !hostname.endsWith('.youtube.com')) {
      return false;
    }
    
    // Block YouTube homepage
    if (urlObj.pathname === '/' || urlObj.pathname === '') {
      return true;
    }
    
    // Check blocked paths
    for (const path of YOUTUBE_BLOCKED_PATHS) {
      if (urlObj.pathname.startsWith(path)) {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Check if URL is a YouTube video page
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's a video page
 */
function isYouTubeVideo(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    if (hostname !== 'youtube.com' && !hostname.endsWith('.youtube.com')) {
      return false;
    }
    
    return urlObj.pathname === '/watch' && urlObj.searchParams.has('v');
  } catch (e) {
    return false;
  }
}

/**
 * Extract video ID from YouTube URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} - Video ID or null
 */
function extractYouTubeVideoId(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v');
  } catch (e) {
    return null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BLOCKED_DOMAINS,
    YOUTUBE_BLOCKED_PATHS,
    isBlocked,
    isYouTubePathBlocked,
    isYouTubeVideo,
    extractYouTubeVideoId
  };
}
