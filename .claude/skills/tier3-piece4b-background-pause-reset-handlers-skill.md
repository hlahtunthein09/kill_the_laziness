# Skill: Tier 3 Piece 4b — Background PAUSE/RESET Handlers

## Goal
Add `PAUSE_TIMER` and `RESET_TIMER` forwarding actions to the background message handler.

## Files to Read
1. `extension/lib/messageHandler.ts`
2. `extension/lib/__tests__/controlMessage.test.ts`

## Files to Create
None.

## Files to Modify
1. `extension/lib/messageHandler.ts`
2. `extension/lib/__tests__/controlMessage.test.ts`

## Implementation Details
- Add to `TimerMessage` union:
  ```ts
  | { action: "PAUSE_TIMER" }
  | { action: "RESET_TIMER" }
  ```
- In `handleMessage`, add cases for `PAUSE_TIMER` and `RESET_TIMER`:
  - Query tabs for `http://localhost:3000/*`.
  - Send `{ action: "EXT_PAUSE_TIMER" }` or `{ action: "EXT_RESET_TIMER" }` to the first matching tab.
  - Return `{ ok: true, forwarded: true }` or `{ ok: false, error: "No FocusFlow tab found" }`.
- Reuse the existing `getBrowser()` helper from Piece 4a.

## Test Strategy
Extend `extension/lib/__tests__/controlMessage.test.ts`:
1. Test: `PAUSE_TIMER` forwards `EXT_PAUSE_TIMER` to FocusFlow tab.
2. Test: `RESET_TIMER` forwards `EXT_RESET_TIMER` to FocusFlow tab.
3. Test: both return error when no FocusFlow tab exists.

Run:
1. `npx vitest run extension/lib/__tests__/controlMessage.test.ts`
2. `npx tsc --noEmit`
3. `npm run build:ext`

## Verification Checklist
- [ ] `PAUSE_TIMER` and `RESET_TIMER` actions added
- [ ] Both forward correct messages to FocusFlow tab
- [ ] 3 new tests passing (6 total in file)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds

## Notes
- No new files.
- Keep under 30 lines of change.
