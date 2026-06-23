# Skill: Piece 7b — Active Project Visual Indicator

## Goal
Make the active project immediately obvious in the project list.

## Files to Read
1. `components/projects/ProjectCard.tsx`
2. `components/projects/__tests__/ProjectCard.test.tsx`

## Files to Create
None.

## Files to Modify
1. `components/projects/ProjectCard.tsx` — add active-project badge and card-level highlight.
2. `components/projects/__tests__/ProjectCard.test.tsx` — add test for active indicator.

## Implementation Details
- `isActive` flag is already computed in `ProjectCard` from Piece 7a.
- Add a `Badge` in `CardHeader` (next to the status badge) when `isActive`:
  - Burmese: `"လက်ရှိ focus လုပ်နေသည်"`
  - English subtitle: `"Currently focusing"`
  - Use `bg-teal-500 text-white` so it stands out.
- Add a card-level ring/border highlight when active:
  - `cn(..., isActive && "ring-2 ring-teal-500 border-teal-500")`
- Keep the existing focus button from Piece 7a unchanged.

## Test Strategy
- Mock `useFocusStore` so `activeProjectId` matches the rendered project.
- Test 1: active project shows the "Currently focusing" badge.
- Test 2: active project card has the teal ring/border highlight class.
- Test 3: inactive project does not show the active badge.

Run:
1. `npx vitest run components/projects/__tests__/ProjectCard.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Active badge renders only on active project
- [ ] Active card has visible highlight border/ring
- [ ] Inactive cards look unchanged
- [ ] ProjectCard tests pass (existing + new)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep changes under 30 lines.
- Do not change button behavior from Piece 7a.
- Use existing `cn()` utility for conditional classes.
