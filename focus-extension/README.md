# Study Planner AI - Focus Mode Extension

Production-ready Chrome Extension that blocks distracting websites during focus sessions.

## Features

- ✅ Syncs with Study Planner AI backend
- ✅ Blocks social media, entertainment, and gaming sites
- ✅ Smart YouTube filtering (educational only)
- ✅ Beautiful blocked page UI
- ✅ Real-time focus status
- ✅ Motivational quotes

## Installation

### Development Mode

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `focus-extension` folder
5. Extension is now installed!

### Configuration

Edit these files to match your backend:

**utils/api.js**
```javascript
const API_BASE_URL = 'https://your-backend-url.com';
```

**popup/popup.js**
```javascript
const DASHBOARD_URL = 'https://your-dashboard-url.com';
```

**blocked/blocked.js**
```javascript
const DASHBOARD_URL = 'https://your-dashboard-url.com';
```

## Backend Integration

The extension expects these endpoints:

### GET /api/focus/status/:userId
Returns current focus session status.

Response:
```json
{
  "active": true,
  "endsAt": "2026-03-09T15:00:00Z"
}
```

### POST /api/youtube/verify
Verifies if YouTube video is educational.

Request:
```json
{
  "urlOrId": "VIDEO_ID"
}
```

Response:
```json
{
  "ok": true,
  "isEducational": true,
  "reason": "Educational content allowed"
}
```

## File Structure

```
focus-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (main logic)
├── content.js            # YouTube page modifications
├── utils/
│   ├── api.js           # Backend API calls
│   ├── blocklist.js     # Domain blocking logic
│   └── youtube.js       # YouTube caching
├── popup/
│   ├── popup.html       # Extension popup UI
│   ├── popup.css        # Popup styles
│   └── popup.js         # Popup logic
├── blocked/
│   ├── blocked.html     # Blocked page UI
│   ├── blocked.css      # Blocked page styles
│   └── blocked.js       # Blocked page logic
└── icons/               # Extension icons
```

## How It Works

1. **Background Service Worker** polls backend every 10 seconds
2. When focus mode is active, it intercepts navigation
3. Blocked domains redirect to `blocked.html`
4. YouTube videos are verified via backend API
5. Results are cached to reduce API calls

## Customization

### Add More Blocked Domains

Edit `utils/blocklist.js`:

```javascript
const BLOCKED_DOMAINS = {
  social: ['instagram.com', 'facebook.com'],
  // Add more categories
};
```

### Change Sync Interval

Edit `background.js`:

```javascript
const SYNC_INTERVAL = 10000; // milliseconds
```

## Testing

1. Start your backend server
2. Load extension in Chrome
3. Start a focus session in your web app
4. Try visiting blocked sites
5. Extension should redirect to blocked page

## Production Deployment

1. Update all URLs to production
2. Create icons (16x16, 48x48, 128x128)
3. Test thoroughly
4. Package extension as .zip
5. Submit to Chrome Web Store

## License

MIT
