# Skill: Extension WXT Setup + Manifest Build

## Purpose
Set up the WXT-based Manifest V3 browser extension folder and build configuration.

## Scope
- **Create**
  - `wxt.config.ts`
  - `extension/entrypoints/background.ts`
  - `extension/entrypoints/popup.html`
  - `extension/README.md`
  - `.claude/memory/extension-architecture.md`
- **Modify**
  - `package.json` — add WXT dependency and scripts
- **Size**: Small — 6 files, ~120 lines

## References
- Context7 `/wxt-dev/wxt`
- Context7 `/websites/developer_mozilla_en-us_mozilla_add-ons_webextensions`
- `.claude/references.md` — extension examples

## Steps
1. Read `.claude/CLAUDE.md`, `.claude/memory/conventions.md`, `.claude/memory/progress.md`.
2. Install `wxt` as a dev dependency: `npm install -D wxt`.
3. Create `wxt.config.ts` at project root:
   ```ts
   import { defineConfig } from "wxt";
   export default defineConfig({
     srcDir: "extension",
     manifest: {
       name: "FocusFlow AI",
       description: "Anti-distraction focus companion for FocusFlow AI",
       permissions: [
         "storage",
         "tabs",
         "alarms",
         "notifications",
         "scripting",
         "declarativeNetRequest",
       ],
       host_permissions: [
         "*://*.youtube.com/*",
         "*://*.instagram.com/*",
         "*://*.tiktok.com/*",
         "*://*.facebook.com/*",
         "*://*.twitter.com/*",
         "*://*.reddit.com/*",
         "*://*.netflix.com/*",
       ],
     },
   });
   ```
4. Create `extension/entrypoints/background.ts`:
   ```ts
   export default defineBackground(() => {
     console.log("FocusFlow AI background service worker started");
   });
   ```
5. Create `extension/entrypoints/popup.html` as a minimal placeholder.
6. Add scripts to root `package.json`:
   - `dev:ext`: `wxt`
   - `build:ext`: `wxt build`
   - `zip:ext`: `wxt zip`
   - `postinstall`: `wxt prepare`
7. Create `extension/README.md` with manual load instructions.
8. Create `.claude/memory/extension-architecture.md` summarizing manifest/permissions and messaging plans.
9. Run `npm install` and `npm run build:ext` to verify.
10. Update `.claude/memory/progress.md`.

## Rules
- Use WXT defaults where possible.
- Storage keys must use `ff_` prefix when introduced later.
- Do not implement actual blocking, notifications, or popup logic in this piece.
- Cross-browser support target: Chrome, Edge, Brave, Firefox (where MV3 compatible).

## Agent
- **Extension Engineer**

## Verification
- `npm install` succeeds.
- `npm run build:ext` succeeds and produces output.
- No TypeScript errors in generated entrypoints.
