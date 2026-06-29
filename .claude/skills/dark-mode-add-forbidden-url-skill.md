# Skill — Dark Mode AddForbiddenUrl (Piece 4a)

## Scope
Fix hardcoded light-only colors in the add-forbidden-URL input so it renders correctly in dark mode.

Modify:
- `components/settings/AddForbiddenUrl.tsx`
- `components/settings/__tests__/AddForbiddenUrl.test.tsx`

## Changes
1. `AddForbiddenUrl.tsx`
   - Title: replace `text-stone-900` with `text-foreground`.
   - Subtitles/descriptions: replace `text-stone-500` with `text-muted-foreground`.
   - URL input: replace `bg-white border-stone-200 text-stone-900` with `bg-background border-input text-foreground`.
   - Add button: use shadcn `Button` (already tokenized) or replace any hardcoded classes.
   - Error text: use `text-destructive` (already correct) and ensure surrounding text uses `text-muted-foreground`.

2. `AddForbiddenUrl.test.tsx`
   - Add one test asserting the rendered component does not contain hardcoded light-only classes (`bg-white`, `text-stone-900`, `border-stone-200`).

## Test Strategy
Run only this component’s tests:
`npx vitest run components/settings/__tests__/AddForbiddenUrl.test.tsx`

## Verification Checklist
- [ ] `AddForbiddenUrl.tsx` updated.
- [ ] `AddForbiddenUrl.test.tsx` updated and passing.
- [ ] `npx tsc --noEmit` passes.
- [ ] No browser automation.
