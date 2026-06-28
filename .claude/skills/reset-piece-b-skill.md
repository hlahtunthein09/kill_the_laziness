# Skill: Reset Piece B — Wire True Reset in `useTimer`

## Goal
Make the `useTimer` reset action actually return the timer to its session-start values by subtracting the elapsed delta from the store using the new decrement actions.

## Scope
- Modify only `hooks/useTimer.ts`.
- Modify only `hooks/__tests__/useTimer.test.tsx`.
- Do NOT touch `lib/store/slices/projectSlice.ts` beyond calling the already-added actions.
- Do NOT touch `components/timer/TimerPanel.tsx` yet.

## Required Changes
1. In `hooks/useTimer.ts`:
   - Add two refs to track the session baseline:
     - `sessionStartProjectElapsedRef`
     - `sessionStartSubPieceRemainingRef`
   - On mount / when `projectId` or `subPieceId` changes, set these refs to the current display values (`init.projectElapsed` / `init.subPieceRemaining`).
   - In the `reset` callback:
     - Pause/clear RAF as now.
     - Compute `projectDelta = projectElapsedRef.current - sessionStartProjectElapsedRef.current`.
     - Compute `subPieceDelta = sessionStartSubPieceRemainingRef.current - subPieceRemainingRef.current`.
     - If `projectDelta > 0`, call `useFocusStore.getState().decrementProjectTime(projectId, projectDelta)`.
     - If `subPieceId` is defined and `subPieceDelta > 0`, call `useFocusStore.getState().decrementSubPieceTime(projectId, subPieceId, subPieceDelta)`.
     - Reset display state and refs to the baseline values.
     - Remove `ff_active_session` from localStorage.
2. Update existing reset tests to expect baseline values and verify store is reverted.

## Tests
In `hooks/__tests__/useTimer.test.tsx`:
- `reset` returns project elapsed and sub-piece remaining to baseline (0 / allocated time).
- `reset` subtracts elapsed time from store (`totalTimeSeconds`, `elapsedSeconds`).
- `reset` when no time has elapsed does not change store values.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run hooks/__tests__/useTimer.test.tsx` passes.
- [ ] No files other than `hooks/useTimer.ts` and `hooks/__tests__/useTimer.test.tsx` are modified.
