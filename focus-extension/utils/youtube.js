// YouTube-specific utilities

/**
 * Cache for verified YouTube videos
 * Prevents repeated API calls for same video
 */
const videoCache = new Map();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Check if video is in cache and still valid
 * @param {string} videoId - YouTube video ID
 * @returns {Object|null} - Cached result or null
 */
function getCachedVideo(videoId) {
  const cached = videoCache.get(videoId);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    videoCache.delete(videoId);
    return null;
  }
  
  return cached.result;
}

/**
 * Cache video verification result
 * @param {string} videoId - YouTube video ID
 * @param {Object} result - Verification result
 */
function cacheVideo(videoId, result) {
  videoCache.set(videoId, {
    result,
    timestamp: Date.now()
  });
}

/**
 * Clear video cache
 */
function clearCache() {
  videoCache.clear();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCachedVideo,
    cacheVideo,
    clearCache
  };
}
