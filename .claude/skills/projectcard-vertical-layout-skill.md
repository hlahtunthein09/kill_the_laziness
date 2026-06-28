# Skill: ProjectCard Vertical Responsive Layout

## Goal
Refactor `components/projects/ProjectCard.tsx` to use vertical stacking for badges and footer actions so the card never overflows horizontally on narrow widths.

## Scope
- Only modify `components/projects/ProjectCard.tsx`.
- Update `components/projects/__tests__/ProjectCard.test.tsx` only if existing assertions break.

## Required Changes
1. **Header badges:** Change status + currently-focusing badges from horizontal `flex` to vertical `flex-col` stack.
2. **Footer:** Change total-time + focus button + add-sub-piece button from horizontal `justify-between` to vertical stack with `flex-col`.
3. **Focus button:** Allow text to wrap to two lines with `whitespace-normal` and `leading-tight`.
4. **Buttons:** Make focus button and add-sub-piece button full-width (`w-full`) for easy tapping.
5. **Total time:** Render as a clean stat row or badge so it is readable.

## Test Strategy
- Run `npx vitest run components/projects/__tests__/ProjectCard.test.tsx`.
- Fix any failing selectors/assertions caused by layout changes.
- Run `npx tsc --noEmit`.

## Verification
- TypeScript clean.
- All ProjectCard tests pass.
- Optional: user manually resizes browser to confirm no horizontal overflow.
