# Skill: Tier 3 Piece 4d — Popup Pause/Reset Buttons

## Goal
Add Pause and Reset buttons to the extension popup.

## Why
Users should be able to pause or reset the active focus session directly from the extension popup without switching to the web app.

## Files to Read
1. `extension/entrypoints/popup.html`
2. `extension/lib/popup.ts`
3. `extension/lib/__tests__/popup-start.test.ts`

## Files to Create
1. `extension/lib/__tests__/popup-pause-reset.test.ts`

## Files to Modify
1. `extension/entrypoints/popup.html`
2. `extension/lib/popup.ts`

## Implementation Details
- In `popup.html`, add two buttons inside `#popup-content` next to Start:
  ```html
  <button id="pause-btn" class="btn btn-secondary" type="button">ခဏရပ်ရန် (Pause)</button>
  <button id="reset-btn" class="btn btn-outline" type="button"> ပြန်စရန် (Reset)</button>
  ```
- In `popup.ts`, add `setupPauseResetButtons(state)`:
  - Find `#pause-btn` and `#reset-btn`.
  - Show both when `state` exists and `state.isRunning === true`.
  - Hide both when no session or when paused.
  - Pause click: `getBrowser().runtime.sendMessage({ action: "PAUSE_TIMER" })`.
  - Reset click: `getBrowser().runtime.sendMessage({ action: "RESET_TIMER" })`.
- Call `setupPauseResetButtons(state)` inside `renderPopup`.

## Test Strategy
Create `extension/lib/__tests__/popup-pause-reset.test.ts`:
1. Clicking Pause sends `PAUSE_TIMER` when running.
2. Clicking Reset sends `RESET_TIMER` when running.
3. Pause/Reset buttons shown when `isRunning: true`.
4. Pause/Reset buttons hidden when `isRunning: false` or state is null.

Use `@webext-core/fake-browser` and jsdom.

Run:
1. `npx vitest run extension/lib/__tests__/popup-pause-reset.test.ts`
2. `npx tsc --noEmit`
3. `npm run build:ext`

## Verification Checklist
- [ ] Pause and Reset buttons added to `popup.html`
- [ ] `popup.ts` sends `PAUSE_TIMER` and `RESET_TIMER` on click
- [ ] Button visibility tied to running state
- [ ] 4 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds

## Notes
- Keep under 40 lines of change.
