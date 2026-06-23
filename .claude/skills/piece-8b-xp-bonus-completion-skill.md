# Skill: Piece 8b — XP Bonus on Sub-Piece Completion

## Goal
Give a burst of XP when a sub-piece is completed to make progress feel rewarding.

## Files to Read
1. `lib/store/slices/projectSlice.ts`
2. `lib/constants.ts`
3. `lib/store/__tests__/useFocusStore.test.ts`

## Files to Create
None.

## Files to Modify
1. `lib/store/slices/projectSlice.ts` — update `completeSubPiece` to add XP bonus.
2. `lib/store/__tests__/useFocusStore.test.ts` — add test verifying XP bonus on completion.

## Implementation Details
- Import `XP_SUB_PIECE_COMPLETE` from `lib/constants.ts` (if not already imported from Piece 8a).
- In `completeSubPiece`, after marking the sub-piece status as `"completed"`, add `XP_SUB_PIECE_COMPLETE` to the project's `xp` field.
- Keep existing sub-piece status update behavior unchanged.

## Test Strategy
- Use the existing `useFocusStore` test file pattern.
- Test: create a project with one sub-piece, call `completeSubPiece(projectId, subPieceId)`, assert sub-piece status is `"completed"` and project `xp` equals `XP_SUB_PIECE_COMPLETE`.

Run:
1. `npx vitest run lib/store/__tests__/useFocusStore.test.ts`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `completeSubPiece` adds `XP_SUB_PIECE_COMPLETE` XP to the project
- [ ] `XP_SUB_PIECE_COMPLETE` imported and used
- [ ] Store tests pass (existing + new)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep changes under 20 lines.
- Do not add new slice or new store.
- Dashboard `currentLevel` will automatically update because it reads `project.xp`.
