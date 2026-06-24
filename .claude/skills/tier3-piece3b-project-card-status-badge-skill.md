# Skill: Tier 3 Piece 3b — ProjectCard Status Badge Styling

## Goal
Make `ProjectCard` status badge color reflect the project `status` value.

## Files to Read
1. `components/projects/ProjectCard.tsx`
2. `lib/types/index.ts`
3. `components/projects/__tests__/ProjectCard.test.tsx`

## Files to Create
1. `components/projects/__tests__/ProjectCard.status.test.tsx`

## Files to Modify
1. `components/projects/ProjectCard.tsx`

## Implementation Details
- Keep the existing `STATUS_LABELS` map for Burmese/English text.
- Add a `STATUS_COLORS` map:
  - `idle`: `bg-stone-100 text-stone-600 border-stone-200`
  - `running`: `bg-teal-100 text-teal-700 border-teal-200`
  - `paused`: `bg-amber-100 text-amber-700 border-amber-200`
  - `completed`: `bg-emerald-100 text-emerald-700 border-emerald-200`
- Apply `STATUS_COLORS[project.status]` to the status badge instead of the project-color badge style.
- Keep the "Currently focusing" active badge unchanged.

## Test Strategy
Create `components/projects/__tests__/ProjectCard.status.test.tsx`:
1. Renders `idle` status badge with stone classes.
2. Renders `running` status badge with teal classes.
3. Renders `paused` status badge with amber classes.
4. Renders `completed` status badge with emerald classes.

Run:
1. `npx vitest run components/projects/__tests__/ProjectCard.status.test.tsx components/projects/__tests__/ProjectCard.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Status badge uses status-based colors
- [ ] Existing active project badge preserved
- [ ] 4 new tests passing
- [ ] Existing `ProjectCard` tests still passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- No store changes.
- Keep under 30 lines of modification.
