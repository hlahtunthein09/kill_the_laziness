# Skill: Tier 3 Piece 3a — Project Status Store Logic

## Goal
Update project `status` automatically in the Zustand store based on focus and completion.

## Files to Read
1. `lib/store/slices/projectSlice.ts`
2. `lib/types/index.ts`
3. `lib/store/__tests__/useFocusStore.test.ts`

## Files to Create
1. `lib/store/__tests__/project-status.test.ts`

## Files to Modify
1. `lib/store/slices/projectSlice.ts`

## Implementation Details
- Modify `setActiveProject(id)`:
  - Set the active project's status to `"running"`.
  - Set any previously `running` project's status to `"idle"`.
  - Other projects keep their existing status.
- Modify `completeSubPiece(projectId, subPieceId)`:
  - After marking sub-piece completed, check if all sub-pieces in the project are `completed`.
  - If yes, set project status to `"completed"`.
- Do not change `incrementProjectTime` or other actions.

## Test Strategy
Create `lib/store/__tests__/project-status.test.ts`:
1. `setActiveProject` marks target project as `running`.
2. `setActiveProject` marks previous active project as `idle`.
3. `completeSubPiece` marks project `completed` when all sub-pieces are done.
4. `completeSubPiece` keeps project `running` when some sub-pieces remain incomplete.

Run:
1. `npx vitest run lib/store/__tests__/project-status.test.ts`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `setActiveProject` updates statuses correctly
- [ ] `completeSubPiece` updates project status when all sub-pieces done
- [ ] 4 new tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- No UI changes in this sub-piece.
- Keep changes under 40 lines.
