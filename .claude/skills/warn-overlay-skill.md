# Skill: Warn Mode Content Script Overlay Build

## Purpose
Add a calming warning overlay on distracting sites when strict mode is disabled.

## Scope
- **Create**
  - `extension/entrypoints/warn.content.ts`
  - `extension/lib/warnOverlay.ts`
  - `extension/lib/__tests__/warnOverlay.test.ts`
- **Modify**: none
- **Size**: Small — 3 files, ~130 lines

## References
- `.claude/memory/extension-architecture.md`
- `extension/lib/urlChecker.ts`
- `extension/lib/storage.ts`
- Context7 `/wxt-dev/wxt` — content script entrypoints
- Context7 `/websites/developer_mozilla_en-us_mozilla_add-ons_webextensions` — content script injection

## Steps
1. Read `.claude/CLAUDE.md`, `.claude/memory/extension-architecture.md`, `.claude/memory/progress.md`.
2. Read `extension/lib/urlChecker.ts`, `extension/lib/storage.ts`, `lib/motivation.ts`.
3. Create `extension/lib/warnOverlay.ts`.
   - `injectWarnOverlay(message: { my: string; en: string }): () => void`
   - Creates a full-screen semi-transparent overlay with a centered card.
   - Shows Burmese message (English secondary), a "ပြန်ဖocus လုပ်မယ် (Back to Focus)" button that closes the tab or navigates back, and a "ဆက်ကြည့်မယ် (Continue anyway)" button that removes the overlay.
   - Returns a cleanup function that removes the overlay.
   - Use inline styles to avoid CSS bundling issues in content scripts.
4. Create `extension/entrypoints/warn.content.ts`.
   - `defineContentScript({ matches: ["*://*.youtube.com/*", ...] })` (forbidden host patterns).
   - In `main()`:
     - Read current URL and settings from extension storage.
     - If strict mode is enabled, do nothing (background handles redirect).
     - If URL is forbidden and not strict mode, call `getMotivation({ ... })` for a struggling message and inject overlay.
5. Create `extension/lib/__tests__/warnOverlay.test.ts`.
   - Use jsdom to test DOM overlay creation.
   - Test that `injectWarnOverlay` appends overlay to document.body.
   - Test that cleanup removes overlay.
   - Test button clicks (continue removes overlay).
6. Run `npx tsc --noEmit` and `npx vitest run extension/lib/__tests__/warnOverlay.test.ts`.
7. Run `npm run build:ext` to verify WXT builds the content script.
8. Update `.claude/memory/progress.md`.

## Rules
- Use `browser.*` APIs in content script.
- Do not redirect in this piece; only warn overlay.
- Burmese-first labels.
- Pastel nature theme colors.
- Keep overlay non-intrusive but visible.

## Agent
- **Extension Engineer**

## Verification
- TypeScript compiles.
- Overlay tests pass.
- `npm run build:ext` succeeds and includes warn content script.
- Overlay renders with message and buttons.
