# Skill: Tier 3 Piece 4c — Popup Start Button

## Goal
Add a Start button to the extension popup that sends `START_TIMER` to the background.

## Why
Users should be able to start a focus session directly from the extension popup without switching back to the web app tab.

## Files to Read
1. `extension/entrypoints/popup.html`
2. `extension/lib/popup.ts`
3. `extension/lib/__tests__/popup.test.ts`

## Files to Create
1. `extension/lib/__tests__/popup-start.test.ts`

## Files to Modify
1. `extension/entrypoints/popup.html`
2. `extension/lib/popup.ts`

## Implementation Details
- In `popup.html`, add a Start button inside `#popup-content`:
  ```html
  <button id="start-btn" class="btn btn-primary" type="button">
    စတင်ရန် (Start)
  </button>
  ```
- In `popup.ts`, add `setupStartButton()`:
  - Find `#start-btn`.
  - On click, call `getBrowser().runtime.sendMessage({ action: "START_TIMER" })`.
  - Optionally disable the button or show a brief feedback.
- Only show Start button when session exists and is not running; hide when running.
- Use existing `getBrowser()` pattern from `popup.ts`.

## Test Strategy
Create `extension/lib/__tests__/popup-start.test.ts`:
1. Test: clicking Start button sends `START_TIMER` message.
2. Test: Start button is hidden when no session exists.
3. Test: Start button is shown when session exists and `isRunning: false`.

Use `@webext-core/fake-browser` and jsdom.

Run:
1. `npx vitest run extension/lib/__tests__/popup-start.test.ts`
2. `npx tsc --noEmit`
3. `npm run build:ext`

## Verification Checklist
- [ ] Start button added to `popup.html`
- [ ] `popup.ts` sends `START_TIMER` on click
- [ ] Button visibility tied to session/running state
- [ ] 3 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds

## Notes
- Only Start button in this piece. Pause/Reset come next.
- Keep under 40 lines of change.
