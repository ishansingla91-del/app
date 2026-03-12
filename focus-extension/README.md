# Focus Extension

Canonical Chrome extension folder for this app:

- `focus-extension/`

The app backend bundles this exact folder from:

- `GET /extension-files` in [routes.ts](/Users/ishan/OneDrive/Attachments/app/server/routes.ts)

## Install In Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder: `focus-extension`

## What It Includes

- strict blocked-domain redirects (`rules.json`)
- educational-only YouTube filtering (`youtube-filter.js`)
- anti-bypass content enforcement (`content.js`)
- session/PIN/time logic in background service worker (`background.js`)
- fullscreen block page with PIN controls (`block.html`, `block.css`, `block.js`)

## Notes

- This repository intentionally keeps only one extension source of truth:
  - `focus-extension/`
- Any old duplicate folder (`extension/`) should be removed.
