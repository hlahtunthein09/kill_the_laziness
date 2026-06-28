# Skill: G2a — Store `refocusSubPiece` Action

## Goal
Add a store action that lets a user refocus a completed sub-piece by resetting it to idle and optionally choosing a new duration.

## Scope
- Modify only `lib/store/slices/projectSlice.ts`.
- Modify only `lib/store/__tests__/useFocusStore.test.ts`.

## Required Changes
1. In `lib/store/slices/projectSlice.ts`:
   - Add `refocusSubPiece: (projectId: string, subPieceId: string, allocatedMinutes?: number) => void` to the `ProjectSlice` interface.
   - Implement the action:
     - Find the project and sub-piece.
     - Set the sub-piece's `status` to `"idle"` and `elapsedSeconds` to `0`.
     - If `allocatedMinutes` is provided and > 0, update the sub-piece's `allocatedMinutes`.
     - Recompute the project's `status` based on its sub-pieces (completed only if all are completed; otherwise idle).
     - Do not modify project total time, XP, fortress, or daily focus values — refocus is about reusing the sub-piece, not erasing logged time.
2. In `lib/store/__tests__/useFocusStore.test.ts`:
   - Add tests:
     - `refocusSubPiece` resets a completed sub-piece to idle with elapsed 0.
     - `refocusSubPiece` updates allocated minutes when provided.
     - `refocusSubPiece` keeps existing allocated minutes when not provided.
     - Project status is recomputed correctly after refocus.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run lib/store/__tests__/useFocusStore.test.ts` passes.
- [ ] No files outside the scope are modified.
