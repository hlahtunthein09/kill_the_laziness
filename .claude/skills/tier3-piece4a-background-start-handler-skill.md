# Skill: Tier 3 Piece 4a — Background START Handler

## Goal
Handle `START_TIMER` messages from the popup by forwarding them to the FocusFlow web app tab.

## Files to Read
1. `extension/lib/messageHandler.ts`
2. `extension/lib/__tests__/messageHandler.test.ts` (if exists)
3. `extension/entrypoints/background.ts`
4. `wxt.config.ts` (to confirm `tabs` permission)

## Files to Create
1. `extension/lib/__tests__/controlMessage.test.ts`

## Files to Modify
1. `extension/lib/messageHandler.ts`

## Implementation Details
- Add `START_TIMER` to the `TimerMessage` union:
  ```ts
  | { action: "START_TIMER" }
  ```
- In `handleMessage`, add a case for `START_TIMER`:
  - Query tabs for `url: "http://localhost:3000/*"` using `browser.tabs.query`.
  - If a tab is found, send `{ action: "EXT_START_TIMER" }` via `browser.tabs.sendMessage(tabId, message)`.
  - Return `{ ok: true, forwarded: true }` if sent, `{ ok: false, error: "No FocusFlow tab found" }` if not.
- Use dynamic import for `wxt/browser` to avoid `require()` lint issues, following existing pattern in `storage.ts` / `timerAlarm.ts`.
- Allow swappable browser instance for tests (similar to `setBrowserInstance` pattern).

## Test Strategy
Create `extension/lib/__tests__/controlMessage.test.ts`:
1. Test: `START_TIMER` finds FocusFlow tab and sends message.
2. Test: `START_TIMER` returns error when no FocusFlow tab exists.
3. Test: existing `UPDATE_TIMER_STATE` still works.

Use `@webext-core/fake-browser` to mock tabs.

Run:
1. `npx vitest run extension/lib/__tests__/controlMessage.test.ts`
2. `npx tsc --noEmit`
3. `npm run build:ext`

## Verification Checklist
- [ ] `START_TIMER` action added to `TimerMessage`
- [ ] Handler queries tabs and forwards message
- [ ] 3 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds

## Notes
- Only `START_TIMER` in this piece. PAUSE/RESET come later.
- Keep under 50 lines of change.
