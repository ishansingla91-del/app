# Installation Guide

## Prerequisites

1. Google Chrome browser (version 88+)
2. Your Study Planner AI backend running
3. Extension icons created (see icons/README.md)

## Step-by-Step Installation

### 1. Prepare the Extension

Before installing, update these configuration files:

#### Update API URLs

**File: `utils/api.js`**
```javascript
// Change this to your backend URL
const API_BASE_URL = 'http://localhost:5000'; // Development
// const API_BASE_URL = 'https://your-app.com'; // Production
```

**File: `popup/popup.js`**
```javascript
// Change this to your dashboard URL
const DASHBOARD_URL = 'http://localhost:5000';
```

**File: `blocked/blocked.js`**
```javascript
// Change this to your dashboard URL
const DASHBOARD_URL = 'http://localhost:5000';
```

### 2. Create Icons

You need 3 icon files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

See `icons/README.md` for instructions on creating these.

### 3. Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `focus-extension` folder
6. Extension should now appear in your extensions list

### 4. Pin Extension to Toolbar

1. Click the puzzle piece icon in Chrome toolbar
2. Find "Study Planner AI - Focus Mode"
3. Click the pin icon to keep it visible

### 5. Test the Extension

#### Test 1: Check Status
1. Click the extension icon
2. Should show "Focus Mode Inactive"
3. Click "Refresh Status" - should work without errors

#### Test 2: Start Focus Session
1. Go to your Study Planner dashboard
2. Start a focus session (any duration)
3. Click extension icon
4. Should show "Focus Mode Active" with timer

#### Test 3: Block Social Media
1. With focus mode active
2. Try visiting `instagram.com`
3. Should redirect to blocked page

#### Test 4: YouTube Filtering
1. With focus mode active
2. Try visiting YouTube homepage
3. Should be blocked
4. Try an educational video (e.g., Khan Academy)
5. Should be allowed

### 6. Troubleshooting

#### Extension doesn't load
- Check that all files are present
- Check browser console for errors (F12)
- Ensure manifest.json is valid JSON

#### "Focus Mode Inactive" always shows
- Check backend is running
- Check API_BASE_URL is correct
- Check `/api/focus/status/1` endpoint works
- Open browser console (F12) and check for network errors

#### Blocked sites not redirecting
- Check that focus mode is actually active
- Check browser console for errors
- Try reloading the extension

#### YouTube videos not verifying
- Check `/api/youtube/verify` endpoint works
- Check YOUTUBE_API_KEY is set in backend .env
- Check browser console for API errors

### 7. Development Tips

#### View Extension Logs
1. Go to `chrome://extensions/`
2. Find your extension
3. Click "service worker" link
4. Opens DevTools for background script

#### Reload Extension After Changes
1. Go to `chrome://extensions/`
2. Click reload icon on your extension
3. Or use keyboard shortcut: Ctrl+R (when on extensions page)

#### Debug Popup
1. Right-click extension icon
2. Select "Inspect popup"
3. Opens DevTools for popup

#### Debug Blocked Page
1. When on blocked page
2. Press F12 to open DevTools
3. Check console for errors

### 8. Production Deployment

When ready to publish:

1. Update all URLs to production
2. Create proper icons (high quality)
3. Test thoroughly
4. Create a .zip of the extension folder
5. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
6. Pay one-time $5 developer fee
7. Upload .zip file
8. Fill in store listing details
9. Submit for review

## Common Issues

### CORS Errors
If you see CORS errors in console:
- Add CORS headers to your backend
- Or use Chrome extension's host_permissions

### Extension Not Syncing
- Check sync interval (default 10 seconds)
- Check network tab for failed requests
- Verify backend endpoint returns correct format

### YouTube Cache Issues
- Clear cache: Open extension DevTools → Application → Storage → Clear
- Or restart browser

## Need Help?

Check the main README.md for more information or create an issue in the repository.
