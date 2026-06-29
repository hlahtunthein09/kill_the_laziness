# Skill — Dark Mode DailyFocusGoalInput (Piece 3e)

## Scope
Fix hardcoded light-only colors in the daily focus goal input so it renders correctly in dark mode.

Modify:
- `components/settings/DailyFocusGoalInput.tsx`
- `components/settings/__tests__/DailyFocusGoalInput.test.tsx`

## Changes
1. `DailyFocusGoalInput.tsx`
   - Title: replace `text-stone-900` with `text-foreground`.
   - Subtitles/descriptions: replace `text-stone-500` with `text-muted-foreground`.
   - Number input: replace `bg-white border-stone-200 text-stone-900` with `bg-background border-input text-foreground`.
   - Edit/confirm buttons: use `variant="outline"` classes from shadcn (already tokenized) or replace any hardcoded `text-stone-*` / `bg-white` with semantic tokens.
   - Any helper text: use `text-muted-foreground`.

2. `DailyFocusGoalInput.test.tsx`
   - Add one test asserting the rendered input does not contain hardcoded light-only classes (`bg-white`, `text-stone-900`, `border-stone-200`).

## Test Strategy
Run only this component’s tests:
`npx vitest run components/settings/__tests__/DailyFocusGoalInput.test.tsx`

## Verification Checklist
- [ ] `DailyFocusGoalInput.tsx` updated.
- [ ] `DailyFocusGoalInput.test.tsx` updated and passing.
- [ ] `npx tsc --noEmit` passes.
- [ ] No browser automation.
