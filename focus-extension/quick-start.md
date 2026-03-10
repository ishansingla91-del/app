# Quick Start Guide

Get the extension running in 5 minutes!

## 1. Update Configuration (2 minutes)

Open these 3 files and update the URLs:

### File 1: `utils/api.js`
```javascript
const API_BASE_URL = 'http://localhost:5000'; // ← Your backend URL
```

### File 2: `popup/popup.js`
```javascript
const DASHBOARD_URL = 'http://localhost:5000'; // ← Your dashboard URL
```

### File 3: `blocked/blocked.js`
```javascript
const DASHBOARD_URL = 'http://localhost:5000'; // ← Your dashboard URL
```

## 2. Create Placeholder Icons (1 minute)

**Quick method:** Create 3 simple PNG files in `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

**Even quicker:** Use any existing PNG and rename it 3 times (Chrome will resize)

## 3. Load Extension in Chrome (1 minute)

1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" ON (top right)
4. Click "Load unpacked"
5. Select the `focus-extension` folder
6. Done! ✅

## 4. Test It (1 minute)

1. **Start focus session** in your web app
2. **Click extension icon** → Should show "Active"
3. **Visit instagram.com** → Should be blocked
4. **Visit educational YouTube video** → Should work

## That's It!

Your extension is now running. 🎉

## Next Steps

- Read `INSTALLATION.md` for detailed setup
- Read `TESTING.md` for complete test suite
- Customize blocked domains in `utils/blocklist.js`
- Add more motivational quotes in `blocked/blocked.js`

## Troubleshooting

**Extension won't load?**
- Check all files are present
- Check manifest.json is valid

**"Inactive" always shows?**
- Check backend is running
- Check API URL is correct
- Open DevTools (F12) and check console

**Sites not blocking?**
- Make sure focus session is actually active
- Check extension icon shows "ON" badge
- Reload extension and try again

## Need Help?

Check the full documentation:
- `README.md` - Overview
- `INSTALLATION.md` - Detailed setup
- `TESTING.md` - Testing guide
