# Skill: Tier 3 Piece 4f — TimerPanel Reacts to Extension Controls

## Goal
Make `TimerPanel` listen for extension control events and call timer actions.

## Why
The extension popup sends Start/Pause/Reset commands, and the content script dispatches `ff:start`, `ff:pause`, `ff:reset` events. `TimerPanel` must listen and actually control the timer.

## Files to Read
1. `components/timer/TimerPanel.tsx`
2. `components/timer/__tests__/TimerPanel.test.tsx`

## Files to Create
1. `components/timer/__tests__/TimerPanel.extension-controls.test.tsx`

## Files to Modify
1. `components/timer/TimerPanel.tsx`

## Implementation Details
- Add `useEffect` in `TimerPanel` that attaches listeners for `ff:start`, `ff:pause`, `ff:reset` on `window`.
- Use `useCallback` handlers that call `start()`, `pause()`, `reset()` from `useTimer`.
- Only attach listeners when `activeProject` and `firstIncompleteSubPiece` exist.
- Clean up listeners in the effect return.

## Test Strategy
Create `components/timer/__tests__/TimerPanel.extension-controls.test.tsx`:
1. `ff:start` event calls `start()`.
2. `ff:pause` event calls `pause()`.
3. `ff:reset` event calls `reset()`.

Run:
1. `npx vitest run components/timer/__tests__/TimerPanel.extension-controls.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `TimerPanel` listens for `ff:start`, `ff:pause`, `ff:reset`
- [ ] Events call correct timer actions
- [ ] 3 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 30 lines of change.
