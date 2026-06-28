# Skill: Reset Piece A — Store Decrement Actions

## Goal
Add store actions that let `useTimer` reset truly revert the current session's elapsed time by subtracting it from the project and sub-piece totals.

## Scope
- Modify only `lib/store/slices/projectSlice.ts`.
- Modify only `lib/store/__tests__/useFocusStore.test.ts`.
- Do NOT touch `hooks/useTimer.ts`, `components/timer/TimerPanel.tsx`, or other files.

## Required Changes
1. In `ProjectSlice` interface add:
   - `decrementProjectTime: (projectId: string, seconds: number) => void`
   - `decrementSubPieceTime: (projectId: string, subPieceId: string, seconds: number) => void`
2. Implement `decrementProjectTime`:
   - Clamp `totalTimeSeconds` at `0` (do not go negative).
   - Subtract `Math.floor(seconds / 60) * XP_PER_MINUTE` from `xp` (clamp at `0`).
   - Recompute `fortressLevel` and `fortressHealth` from the new `xp`.
   - Subtract `seconds` from `settings.todayFocusSeconds` (clamp at `0`).
   - Leave streak fields unchanged.
3. Implement `decrementSubPieceTime`:
   - Subtract `seconds` from the matching sub-piece's `elapsedSeconds` (clamp at `0`).
   - Do not change sub-piece status.
4. Re-export from the slice file as needed.

## Tests
In `lib/store/__tests__/useFocusStore.test.ts` add:
- `decrementProjectTime` reduces `totalTimeSeconds`, `xp`, and `todayFocusSeconds`, and clamps at `0`.
- `decrementSubPieceTime` reduces `elapsedSeconds` and clamps at `0`.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run lib/store/__tests__/useFocusStore.test.ts` passes.
- [ ] No other files modified.
