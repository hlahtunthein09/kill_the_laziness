# Skill: Wire `TimerPanel` to `useTimer` `onComplete` (Issue #6b)

## Scope
Use the new `onComplete` callback from `useTimer` to reliably show `SessionSummary` when a sub-piece finishes, instead of depending on the fragile `subPieceRemaining` transition effect.

## Files
- `components/timer/TimerPanel.tsx`
- `components/timer/__tests__/TimerPanel.session-summary.test.tsx`

## Changes
1. In `TimerPanel.tsx`:
   - Pass an `onComplete` callback to `useTimer(activeProject?.id, firstIncompleteSubPiece?.id, onComplete)`.
   - The callback sets `showSummary(true)` (and optionally plays completion sound / sets toast trigger, if not already done by the timer).
   - Remove or demote the existing `subPieceRemaining` transition effect that tries to detect completion, since `onComplete` is now the source of truth.
2. In `TimerPanel.session-summary.test.tsx`:
   - Update the mocked `useTimer` to accept the third `onComplete` argument and call it when simulating completion.
   - Ensure tests verify `SessionSummary` renders after the callback fires.

## Test Strategy
- Run `npx vitest run components/timer/__tests__/TimerPanel.session-summary.test.tsx`
- Expect 3/3 tests passing.
- Run `npx vitest run components/timer/__tests__/TimerPanel.test.tsx` to ensure no regressions.
- Run `npx tsc --noEmit`.

## Verification
- No browser verification required; unit tests cover the wiring.
