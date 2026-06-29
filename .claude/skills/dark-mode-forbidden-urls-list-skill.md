# Skill — Dark Mode ForbiddenUrlsList (Piece 4b)

## Scope
Fix hardcoded light-only colors in the forbidden URLs list so it renders correctly in dark mode.

Modify:
- `components/settings/ForbiddenUrlsList.tsx`
- `components/settings/__tests__/ForbiddenUrlsList.test.tsx`

## Changes
1. `ForbiddenUrlsList.tsx`
   - Title: replace `text-stone-900` with `text-foreground`.
   - Subtitles/descriptions: replace `text-stone-500` with `text-muted-foreground`.
   - List container/card: use `bg-card`, `border-border`, `text-card-foreground` if a custom container exists; otherwise rely on shadcn Card tokens.
   - Individual URL rows: replace `bg-white`, `border-stone-200`, `text-stone-*` with `bg-background`, `border-border`, `text-foreground` / `text-muted-foreground`.
   - Remove/reset buttons: use shadcn `Button` tokens or semantic colors.

2. `ForbiddenUrlsList.test.tsx`
   - Add one test asserting the rendered list does not contain hardcoded light-only classes (`bg-white`, `text-stone-900`, `border-stone-200`).

## Test Strategy
Run only this component’s tests:
`npx vitest run components/settings/__tests__/ForbiddenUrlsList.test.tsx`

## Verification Checklist
- [ ] `ForbiddenUrlsList.tsx` updated.
- [ ] `ForbiddenUrlsList.test.tsx` updated and passing.
- [ ] `npx tsc --noEmit` passes.
- [ ] No browser automation.
