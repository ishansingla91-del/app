// API configuration
const API_BASE_URL = 'http://localhost:5000'; // Change to your production URL
const DEFAULT_USER_ID = 1; // Hardcoded for now, can be made dynamic later

/**
 * Get focus session status from backend
 * @returns {Promise<Object>} - Focus status object
 */
async function getFocusStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/focus/status/${DEFAULT_USER_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      active: data.active || false,
      endsAt: data.endsAt || null
    };
  } catch (error) {
    console.error('Error fetching focus status:', error);
    return {
      active: false,
      endsAt: null
    };
  }
}

/**
 * Verify if YouTube video is educational
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Verification result
 */
async function verifyYouTubeVideo(videoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/youtube/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ urlOrId: videoId })
    });
    
    if (!response.ok) {
      return {
        allowed: false,
        reason: 'Unable to verify video'
      };
    }
    
    const data = await response.json();
    return {
      allowed: data.ok && data.isEducational,
      reason: data.reason || 'Video verification failed',
      title: data.title || '',
      confidence: data.confidence || 0
    };
  } catch (error) {
    console.error('Error verifying YouTube video:', error);
    return {
      allowed: false,
      reason: 'Network error during verification'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_BASE_URL,
    DEFAULT_USER_ID,
    getFocusStatus,
    verifyYouTubeVideo
  };
}
