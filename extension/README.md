# FocusFlow AI Browser Extension

## Overview

The FocusFlow AI browser extension is the anti-distraction enforcement layer of the FocusFlow AI productivity ecosystem. It blocks or warns users when they navigate to forbidden distraction sites during active focus sessions.

## Tech Stack

- **Build tool**: [WXT](https://wxt.dev/) — Modern web extension build tool
- **Manifest**: Manifest V3 (MV3)
- **Browser API**: `webextension-polyfill` for cross-browser compatibility

## Manual Load Instructions

### Chrome / Edge / Brave

1. Run `npm run build:ext` to produce the extension bundle.
2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`).
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the `.output/chrome-mv3` folder produced by the build.
6. The FocusFlow AI extension icon should appear in your toolbar.

### Firefox (MV3 compatible builds)

1. Run `npm run build:ext`.
2. Open Firefox and navigate to `about:debugging`.
3. Click **This Firefox** → **Load Temporary Add-on**.
4. Select the `manifest.json` file inside `.output/firefox-mv3`.

## Development

```bash
# Start WXT dev mode with hot reload
npm run dev:ext

# Build for production
npm run build:ext

# Build and zip for store submission
npm run zip:ext
```

## Architecture

See `.claude/memory/extension-architecture.md` for the full manifest, permissions, and planned messaging architecture.
