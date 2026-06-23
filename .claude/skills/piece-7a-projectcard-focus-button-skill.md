# Skill: Piece 7a — ProjectCard Focus Button

## Goal
Let users pick which project to focus on from the project list by adding a "Focus" button to `ProjectCard`.

## Files to Read
1. `components/projects/ProjectCard.tsx`
2. `components/projects/__tests__/ProjectCard.test.tsx`
3. `lib/store/slices/projectSlice.ts`

## Files to Create
None.

## Files to Modify
1. `components/projects/ProjectCard.tsx` — add a button that calls `setActiveProject(project.id)`.
2. `components/projects/__tests__/ProjectCard.test.tsx` — add a test for the focus button.

## Implementation Details
- Component already uses `useFocusStore`. Add `setActiveProject` selector.
- Add a small button in `CardFooter` (next to `AddSubPieceButton` or on the opposite side) labeled:
  - Burmese: `"ဤပရောဂျက်ကို focus လုပ်မယ်"`
  - English subtitle: `"Focus on this project"`
- Use shadcn/ui `Button` with `variant="outline"` and `size="sm"`.
- Call `setActiveProject(project.id)` on click.
- Optional: highlight the card border when `project.id === activeProjectId` (read from store). Keep this very small — just a conditional class.

## Test Strategy
- Mock `useFocusStore` so tests don't need the real Zustand store.
- Existing tests pass unchanged.
- New test: clicking the focus button calls `setActiveProject` with the project id.

Run:
1. `npx vitest run components/projects/__tests__/ProjectCard.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Focus button renders in `ProjectCard`
- [ ] Clicking button calls `setActiveProject(project.id)`
- [ ] Button uses Burmese-first label
- [ ] ProjectCard tests pass (existing + new)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep changes under 40 lines.
- Do not change `ProjectList` or other components in this piece.
- If adding active highlight, use `cn()` and existing theme colors.
