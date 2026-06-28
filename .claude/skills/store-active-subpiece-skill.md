# Skill: F1 — Store Active Sub-piece ID

## Goal
Add store support for tracking which sub-piece the user has explicitly selected to focus on.

## Scope
- Modify only `lib/store/slices/projectSlice.ts`.
- Modify only `lib/store/__tests__/useFocusStore.test.ts`.

## Required Changes
1. In `lib/store/slices/projectSlice.ts`:
   - Add `activeSubPieceId: string | null` to the `ProjectSlice` interface and initial state.
   - Add `setActiveSubPiece: (projectId: string, subPieceId: string | null) => void` to the interface.
   - Implement `setActiveSubPiece`:
     - Validate that `subPieceId` (if not null) exists under `projectId`.
     - Set `activeSubPieceId` if valid.
     - If `subPieceId` is `null`, clear `activeSubPieceId`.
   - Update `setActiveProject` so that when the active project changes, `activeSubPieceId` is cleared (project-level focus starts with no selected sub-piece).
2. In `lib/store/__tests__/useFocusStore.test.ts`:
   - Add tests:
     - `setActiveSubPiece` sets the active sub-piece ID when valid.
     - `setActiveSubPiece` with `null` clears it.
     - `setActiveSubPiece` ignores an invalid sub-piece ID.
     - `setActiveProject` clears `activeSubPieceId`.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run lib/store/__tests__/useFocusStore.test.ts` passes.
- [ ] No files outside the scope are modified.
