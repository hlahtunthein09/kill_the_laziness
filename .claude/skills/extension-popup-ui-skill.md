# Skill: Extension Popup UI (Piece 13b)

## Purpose
Build a read-only extension popup that shows the current focus session status, project/sub-piece names, elapsed/remaining times, and a link to open the FocusFlow web app.

## Background
- Piece 13a enriched `ExtensionTimerState` with optional `projectName` and `subPieceName`.
- The popup reads from `browser.storage.local` (`ff_extension_timer`) to get the latest synced state.
- Controls (start/pause) are intentionally omitted to avoid desync with the web app timer, which is the source of truth.

## Scope
- **Create**
  - `extension/entrypoints/popup.html` — styled popup markup
  - `extension/entrypoints/popup.ts` — popup logic (read storage, render state, open web app)
  - `extension/lib/__tests__/popup.test.ts` — jsdom tests for rendering logic
- **Modify**: none
- **Size**: Small — 3 files, ~160 lines

## References
- `.claude/memory/extension-architecture.md`
- `.claude/memory/sync-protocol.md`
- `.claude/memory/ui-conventions.md`
- `extension/lib/types.ts`
- `lib/time.ts`
- Context7 `/wxt-dev/wxt` — popup entrypoints and ESM script bundling
- Real-world reference: `dominhduy09/pomodoro-extension` popup pattern

## Steps
1. Read `.claude/CLAUDE.md`, `.claude/memory/extension-architecture.md`, `.claude/memory/progress.md`, `.claude/memory/ui-conventions.md`, `.claude/memory/sync-protocol.md`.
2. Read `extension/lib/types.ts`, `extension/lib/storage.ts`, `lib/time.ts`, and the existing `extension/entrypoints/popup.html` placeholder.
3. Create `extension/entrypoints/popup.html`.
   - Pastel nature theme (`#f0fdfa` background, `#14b8a6` primary).
   - Burmese-first labels with English subtitles.
   - Placeholder elements with IDs for project, sub-piece, status, elapsed, remaining, and open-app button.
   - Load script with `<script src="./popup.ts" type="module"></script>`.
4. Create `extension/entrypoints/popup.ts`.
   - Import `browser` from `wxt/browser`.
   - Import `formatDuration` from `../../lib/time.ts`.
   - Define `TIMER_STATE_KEY = "ff_extension_timer"` and `FOCUSFLOW_URL = "http://localhost:3000/timer"`.
   - Export `renderPopup(state: ExtensionTimerState | null): void` that updates DOM.
   - Define `initPopup(): Promise<void>` that reads storage and calls `renderPopup`; guard against missing DOM elements.
   - Add click listener on the open-app button to call `browser.tabs.create({ url: FOCUSFLOW_URL })`.
   - Auto-call `initPopup()` when DOM elements are present.
5. Create `extension/lib/__tests__/popup.test.ts`.
   - Set up jsdom with popup HTML markup.
   - Mock `browser.storage.local.get` and `browser.tabs.create` via `@webext-core/fake-browser`.
   - Test: no session → empty state message is shown.
   - Test: session with names → project/sub-piece names, elapsed, remaining, and status render.
   - Test: click open-app button → `browser.tabs.create` called with FocusFlow URL.
6. Run `npx tsc --noEmit` and `npx vitest run extension/lib/__tests__/popup.test.ts`.
7. Run `npm run build:ext` and verify `popup.html` and `popup.js` exist in `.output/chrome-mv3/` and manifest contains `action.default_popup`.
8. Update `.claude/memory/progress.md` with a one-line status.

## Rules
- Use `browser.*` APIs via `wxt/browser`.
- Keep popup read-only; no start/pause controls in this piece.
- Burmese-first labels; English secondary.
- Pastel nature theme colors.
- Use `formatDuration` from `lib/time.ts` for elapsed/remaining display.

## Agent
- **Extension Engineer**

## Verification
- TypeScript compiles.
- Popup tests pass.
- `npm run build:ext` succeeds and includes popup bundle.
- Manifest includes `action.default_popup`.
