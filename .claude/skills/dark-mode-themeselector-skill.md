# Skill — Dark Mode ThemeSelector (Piece 3a)

## Scope
Fix hardcoded light-only colors in the theme selector so it renders correctly in dark mode.

Modify:
- `components/settings/ThemeSelector.tsx`
- `components/settings/__tests__/ThemeSelector.test.tsx`

## Changes
1. `ThemeSelector.tsx`
   - Section title: replace `text-stone-900` with `text-foreground`.
   - Subtitles/descriptions: replace `text-stone-500` with `text-muted-foreground`.
   - Native `<select>`: replace `bg-white border-stone-200 text-stone-900` with `bg-background border-input text-foreground`.
   - Remove the manual `dark:` classes on the select (now handled by the semantic tokens above).
   - Icon: replace `text-stone-500` with `text-muted-foreground`.

2. `ThemeSelector.test.tsx`
   - Add one test that asserts the rendered select element has class names containing `bg-background`, `border-input`, and `text-foreground`, and does not contain `bg-white`, `text-stone-900`, or `border-stone-200`.

## Test Strategy
Run only this component’s tests:
`npx vitest run components/settings/__tests__/ThemeSelector.test.tsx`

## Verification Checklist
- [ ] `ThemeSelector.tsx` updated.
- [ ] `ThemeSelector.test.tsx` updated and passing.
- [ ] `npx tsc --noEmit` passes.
- [ ] No browser automation.
