# Skill: Reset Fix D1 — Store Zero-Reset Action

## Goal
Add a store action that zeros out an active sub-piece's elapsed time and subtracts that time from the project's total, so a true "reset to zero" is possible.

## Scope
- Modify only `lib/store/slices/projectSlice.ts`.
- Modify only `lib/store/__tests__/useFocusStore.test.ts`.

## Required Changes
1. In `ProjectSlice` interface add:
   - `resetSubPieceTime: (projectId: string, subPieceId: string) => void`
2. Implement `resetSubPieceTime`:
   - Find the sub-piece and capture its current `elapsedSeconds`.
   - Set the sub-piece's `elapsedSeconds` to `0` and its `status` to `"idle"`.
   - Recompute the project's `subPieces` array with the updated sub-piece.
   - Recompute project `status` based on whether all remaining sub-pieces are completed.
   - Subtract the captured elapsed seconds from the project's `totalTimeSeconds` (clamp at `0`).
   - Subtract `Math.floor(elapsedSeconds / 60) * XP_PER_MINUTE` from project `xp` (clamp at `0`).
   - Recompute `fortressLevel` and `fortressHealth` from the new `xp`.
   - Subtract the elapsed seconds from `settings.todayFocusSeconds` (clamp at `0`).
   - Leave streak fields unchanged.

## Tests
In `lib/store/__tests__/useFocusStore.test.ts` add:
- `resetSubPieceTime` zeros the sub-piece elapsed, reduces project total, XP, and today focus.
- `resetSubPieceTime` clamps project total at `0`.
- `resetSubPieceTime` marks a completed sub-piece as idle and updates project status.
- `resetSubPieceTime` does not affect other sub-pieces.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run lib/store/__tests__/useFocusStore.test.ts` passes.
- [ ] No files outside the scope are modified.
