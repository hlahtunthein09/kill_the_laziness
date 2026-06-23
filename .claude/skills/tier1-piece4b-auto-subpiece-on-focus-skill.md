# Skill: Tier 1 Piece 4b — Auto-Create Sub-Piece When Focusing Empty Project

## Goal
Allow users to focus on a project even if it has no sub-pieces yet by auto-creating a default sub-piece when the focus button is clicked.

## Files to Read
1. `components/projects/ProjectCard.tsx`
2. `components/projects/__tests__/ProjectCard.test.tsx`
3. `lib/store/slices/projectSlice.ts` (for `addSubPiece` signature)

## Files to Create
None.

## Files to Modify
1. `components/projects/ProjectCard.tsx` — auto-create a default sub-piece if project has none before navigating.
2. `components/projects/__tests__/ProjectCard.test.tsx` — add test for auto-creation and navigation on empty project.

## Implementation Details
- Read `addSubPiece` from `useFocusStore` alongside `setActiveProject`.
- In the focus button `onClick` handler, before `setActiveProject` and `router.push("/timer")`:
  - If `project.subPieces.length === 0`, call `addSubPiece({
      projectId: project.id,
      name: "အထွေထွေ focus (General Focus)",
      allocatedMinutes: 25,
      order: 0,
    })`.
- Keep existing focus button behavior for projects that already have sub-pieces.
- Keep navigation to `/timer` unchanged.

## Test Strategy
- Mock `useFocusStore` with `setActiveProject`, `addSubPiece`, `activeProjectId`.
- Existing tests should still pass.
- New test: render a project with no sub-pieces, click focus button, assert `addSubPiece` was called with the default sub-piece, then `setActiveProject` and `router.push("/timer")` were called.
- New test: render a project with sub-pieces, click focus button, assert `addSubPiece` was NOT called.

Run:
1. `npx vitest run components/projects/__tests__/ProjectCard.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Empty project auto-creates a default sub-piece on focus click
- [ ] Project with sub-pieces does not get extra sub-piece
- [ ] Navigation to `/timer` still works
- [ ] Existing ProjectCard tests still pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep changes under 30 lines.
- This completes the friction-free focus flow for all project states.
