# Skill: Tier 1 Piece 1 — Focus Button Navigates to Timer

## Goal
Remove friction from the core workflow: when the user clicks the focus button on a project card, set it as active and immediately navigate to the timer page.

## Files to Read
1. `components/projects/ProjectCard.tsx`
2. `components/projects/__tests__/ProjectCard.test.tsx`

## Files to Create
None.

## Files to Modify
1. `components/projects/ProjectCard.tsx` — add `useRouter` and navigate to `/timer` on focus click.
2. `components/projects/__tests__/ProjectCard.test.tsx` — mock `useRouter` and assert navigation.

## Implementation Details
- Import `useRouter` from `next/navigation`.
- In the focus button's `onClick` handler:
  1. Call `setActiveProject(project.id)`.
  2. Call `router.push("/timer")`.
- Keep the existing button label, styling, and active highlight behavior.
- No other components should change.

## Test Strategy
- Mock `useRouter` from `next/navigation` with a `push` spy.
- Existing tests for rendering, active badge, and focus button store call should still pass.
- New test: clicking the focus button calls `router.push("/timer")`.

Run:
1. `npx vitest run components/projects/__tests__/ProjectCard.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Focus button sets active project and navigates to `/timer`
- [ ] `useRouter` is mocked in tests
- [ ] Navigation test passes
- [ ] Existing ProjectCard tests still pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep changes under 20 lines.
- This is the first Tier 1 piece for transforming the app into a friction-free daily focus tool.
