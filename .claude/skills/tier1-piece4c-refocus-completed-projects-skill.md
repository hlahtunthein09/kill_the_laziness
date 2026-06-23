# Skill: Tier 1 Piece 4c — Re-Focus on Completed Projects

## Goal
Allow users to re-focus on a project even when all its sub-pieces are completed by auto-creating a new default sub-piece.

## Files to Read
1. `components/projects/ProjectCard.tsx`
2. `components/projects/__tests__/ProjectCard.test.tsx`

## Files to Create
None.

## Files to Modify
1. `components/projects/ProjectCard.tsx` — extend focus button logic to create default sub-piece when no incomplete sub-pieces exist.
2. `components/projects/__tests__/ProjectCard.test.tsx` — add test for completed-project re-focus.

## Implementation Details
- In the focus button `onClick` handler, before `setActiveProject` and `router.push("/timer")`:
  - Check `const hasIncomplete = project.subPieces.some((sp) => sp.status !== "completed");`
  - If `!hasIncomplete`, call `addSubPiece({ projectId: project.id, name: "အထွေထွေ focus (General Focus)", allocatedMinutes: 25, order: 0 })`.
- Keep the existing empty-project sub-piece creation logic (this check now covers both cases).
- Keep navigation to `/timer` unchanged.

## Test Strategy
- Existing tests should still pass.
- New test: render a project where all sub-pieces are `completed`, click focus button, assert `addSubPiece` is called with a new default sub-piece, then `setActiveProject` and navigation happen.

Run:
1. `npx vitest run components/projects/__tests__/ProjectCard.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Completed projects can be re-focused
- [ ] New default sub-piece created when no incomplete sub-pieces exist
- [ ] Existing tests still pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep changes under 20 lines.
- This is the final functional fix before pushing Tier 1 to GitHub.
