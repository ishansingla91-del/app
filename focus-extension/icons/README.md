# Extension Icons

## Required Icon Sizes

You need to create PNG icons in these sizes:
- `icon16.png` (16x16) - Toolbar icon
- `icon48.png` (48x48) - Extension management page
- `icon128.png` (128x128) - Chrome Web Store

## How to Create Icons

### Option 1: Use Online Tool
1. Go to https://www.favicon-generator.org/
2. Upload `icon.svg`
3. Generate and download all sizes
4. Rename files to match required names

### Option 2: Use ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Then run:
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Option 3: Use Figma/Photoshop
1. Open `icon.svg` in your design tool
2. Export as PNG in required sizes
3. Save in this folder

## Temporary Solution

For development, you can use placeholder icons:
1. Create simple colored squares in Paint/Preview
2. Save as PNG in required sizes
3. Replace with proper icons later

## Design Guidelines

- Use the gradient colors: #667eea to #764ba2
- Keep design simple and recognizable
- Ensure icon is visible on both light and dark backgrounds
- Clock/timer theme fits the focus mode concept
