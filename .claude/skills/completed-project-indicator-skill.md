# Skill: G1 — Completed Project Visual Indicator

## Goal
Visually distinguish a completed project in `ProjectCard` so users can immediately see which projects are finished.

## Scope
- Modify only `components/projects/ProjectCard.tsx`.
- Modify only `components/projects/__tests__/ProjectCard.test.tsx`.

## Required Changes
1. In `components/projects/ProjectCard.tsx`:
   - When `project.status === "completed"`, add a green border/styling to the card (e.g., `border-emerald-500` or `ring-1 ring-emerald-500`).
   - Ensure it does not conflict with the existing active-project teal ring (`isActive`).
   - Keep the existing completed status badge.
2. In `components/projects/__tests__/ProjectCard.test.tsx`:
   - Add a test that verifies a completed project renders the green visual indicator.
   - Ensure active-project tests still pass.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/projects/__tests__/ProjectCard.test.tsx` passes.
- [ ] No files outside the scope are modified.
