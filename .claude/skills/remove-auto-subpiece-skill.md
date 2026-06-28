# Skill: Remove Auto Sub-piece Creation from ProjectCard Focus

## Goal
Stop `ProjectCard` from automatically creating a default sub-piece when focusing a project. The focus button should simply set the active project and navigate to `/timer`, regardless of whether the project has sub-pieces.

## Scope
- Modify only `components/projects/ProjectCard.tsx`.
- Modify only `components/projects/__tests__/ProjectCard.test.tsx`.

## Required Changes
1. In `components/projects/ProjectCard.tsx`:
   - Locate the focus button click handler.
   - Remove any logic that checks whether the project has incomplete sub-pieces and calls `addSubPiece` to create a default sub-piece.
   - The handler should only call `setActiveProject(project.id)` and `router.push("/timer")`.
2. In `components/projects/__tests__/ProjectCard.test.tsx`:
   - Remove or update tests that assert default sub-piece auto-creation on focus.
   - Add/update a test that verifies focusing a project with no sub-pieces still calls `setActiveProject` and navigates to `/timer`.
   - Keep tests that verify focus navigates to `/timer`.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/projects/__tests__/ProjectCard.test.tsx` passes.
- [ ] No files outside the scope are modified.
