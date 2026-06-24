# Skill: Tier 3 Piece 4e — Web App Control Listener

## Goal
Create a content script that receives extension control messages and dispatches custom DOM events inside the web app.

## Why
The background forwards control messages (`EXT_START_TIMER`, etc.) to the FocusFlow tab, but the web app cannot receive extension messages directly. A content script bridges background messages into the web app page.

## Files to Read
1. `extension/entrypoints/focusSync.content.ts`
2. `extension/entrypoints/warn.content.ts`
3. `extension/lib/__tests__/warnOverlay.test.ts` (for fake-browser/jsdom patterns)

## Files to Create
1. `extension/entrypoints/control.content.ts`
2. `extension/lib/__tests__/control.content.test.ts`

## Files to Modify
None.

## Implementation Details
- Create `extension/entrypoints/control.content.ts`:
  - Use `defineContentScript` with `matches: ["http://localhost:3000/*"]`.
  - Import `browser` from `wxt/browser`.
  - In `main()`, call `browser.runtime.onMessage.addListener(...)`.
  - For `action: "EXT_START_TIMER"`, dispatch `window.dispatchEvent(new CustomEvent("ff:start"))`.
  - For `action: "EXT_PAUSE_TIMER"`, dispatch `window.dispatchEvent(new CustomEvent("ff:pause"))`.
  - For `action: "EXT_RESET_TIMER"`, dispatch `window.dispatchEvent(new CustomEvent("ff:reset"))`.
  - Return `true` for async listener or just `undefined` for sync dispatch.
- Allow swappable browser instance for tests via optional setter (similar to other extension modules).

## Test Strategy
Create `extension/lib/__tests__/control.content.test.ts`:
1. Test: `EXT_START_TIMER` dispatches `ff:start` event.
2. Test: `EXT_PAUSE_TIMER` dispatches `ff:pause` event.
3. Test: `EXT_RESET_TIMER` dispatches `ff:reset` event.

Use `@webext-core/fake-browser` and jsdom. Mock `window.location.href` if needed.

Run:
1. `npx vitest run extension/lib/__tests__/control.content.test.ts`
2. `npx tsc --noEmit`
3. `npm run build:ext`

## Verification Checklist
- [ ] `control.content.ts` created with `defineContentScript`
- [ ] Listens for `EXT_START_TIMER`, `EXT_PAUSE_TIMER`, `EXT_RESET_TIMER`
- [ ] Dispatches corresponding custom events
- [ ] 3 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds

## Notes
- No web app changes in this piece.
- Keep under 40 lines.
