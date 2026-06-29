# Skill — Dark Mode StrictModeToggle (Piece 3b)

## Scope
Fix hardcoded light-only colors in the strict-mode toggle so it renders correctly in dark mode.

Modify:
- `components/settings/StrictModeToggle.tsx`
- `components/settings/__tests__/StrictModeToggle.test.tsx`

## Changes
1. `StrictModeToggle.tsx`
   - Title: replace `text-stone-900` with `text-foreground`.
   - Subtitles/descriptions: replace `text-stone-500` with `text-muted-foreground`.
   - Toggle track (unchecked): replace `bg-stone-300` with `bg-muted`.
   - Toggle track (checked): keep `bg-teal-500` or use `bg-primary` for consistency.
   - Focus ring: replace `peer-focus:ring-teal-300` with `peer-focus:ring-ring`.
   - Toggle knob: replace `bg-white` with `bg-background` so it contrasts against the dark track.

2. `StrictModeToggle.test.tsx`
   - Add one test asserting the rendered toggle track/knob do not contain hardcoded light-only classes (`bg-white`, `bg-stone-300`, `text-stone-900`).

## Test Strategy
Run only this component’s tests:
`npx vitest run components/settings/__tests__/StrictModeToggle.test.tsx`

## Verification Checklist
- [ ] `StrictModeToggle.tsx` updated.
- [ ] `StrictModeToggle.test.tsx` updated and passing.
- [ ] `npx tsc --noEmit` passes.
- [ ] No browser automation.
