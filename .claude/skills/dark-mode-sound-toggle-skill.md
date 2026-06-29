# Skill — Dark Mode SoundToggle (Piece 3d)

## Scope
Fix hardcoded light-only colors in the sound toggle so it renders correctly in dark mode.

Modify:
- `components/settings/SoundToggle.tsx`
- `components/settings/__tests__/SoundToggle.test.tsx`

## Changes
1. `SoundToggle.tsx`
   - Title: replace `text-stone-900` with `text-foreground`.
   - Subtitles/descriptions: replace `text-stone-500` with `text-muted-foreground`.
   - Toggle track (unchecked): replace `bg-stone-300` with `bg-muted`.
   - Toggle track (checked): use `bg-primary`.
   - Focus ring: replace `peer-focus:ring-teal-300` with `peer-focus:ring-ring`.
   - Toggle knob: replace `bg-white` with `bg-background`.

2. `SoundToggle.test.tsx`
   - Add one test asserting the rendered toggle track/knob do not contain hardcoded light-only classes (`bg-white`, `bg-stone-300`, `text-stone-900`).

## Test Strategy
Run only this component’s tests:
`npx vitest run components/settings/__tests__/SoundToggle.test.tsx`

## Verification Checklist
- [ ] `SoundToggle.tsx` updated.
- [ ] `SoundToggle.test.tsx` updated and passing.
- [ ] `npx tsc --noEmit` passes.
- [ ] No browser automation.
