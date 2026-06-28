# Skill: Reset Fix D2a — Add `resetToZero` to `useTimer`

## Goal
Expose a zero-reset action from `useTimer` that calls the new `resetSubPieceTime` store action and updates the timer display to zeroed values.

## Scope
- Modify only `hooks/useTimer.ts`.
- Modify only `hooks/__tests__/useTimer.test.tsx`.

## Required Changes
1. In `hooks/useTimer.ts`:
   - Add `resetToZero: () => void` to the `UseTimerReturn` interface.
   - Implement `resetToZero` callback that:
     - Stops the timer and clears RAF/localStorage/refs (`lastTickRef`, `accumulatedRef`, `lastPersistRef`).
     - If `projectId` and `subPieceId` are defined, calls `useFocusStore.getState().resetSubPieceTime(projectId, subPieceId)`.
     - Re-reads the current project/sub-piece from the store to get the new baseline values.
     - Sets `projectElapsedRef.current` and state to the new project `totalTimeSeconds`.
     - Sets `subPieceRemainingRef.current` and state to the new sub-piece remaining time (`allocatedMinutes * 60 - elapsedSeconds`).
   - Return `resetToZero` from the hook (and from the undefined-projectId safe fallback as a no-op).
2. In `hooks/__tests__/useTimer.test.tsx`:
   - Add a test harness button for `resetToZero`.
   - Add a test that after running time and calling `resetToZero`, the sub-piece `elapsedSeconds` is `0`, `subPieceRemaining` returns to the allocated time, and `projectElapsed` is reduced by the elapsed amount.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run hooks/__tests__/useTimer.test.tsx` passes.
- [ ] No files outside the scope are modified.
