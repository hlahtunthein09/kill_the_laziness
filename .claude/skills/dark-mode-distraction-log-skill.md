# Skill — Dark Mode DistractionLog (Piece 4d)

## Scope
Fix hardcoded light-only colors in the distraction log so it renders correctly in dark mode.

Modify:
- `components/distraction/DistractionLog.tsx`
- `components/distraction/__tests__/DistractionLog.test.tsx`

## Changes
1. `DistractionLog.tsx`
   - Title: replace `text-stone-900` with `text-foreground`.
   - Subtitles/descriptions: replace `text-stone-500` with `text-muted-foreground`.
   - Log entries container/rows: replace `bg-white`, `border-stone-200`, `text-stone-*` with `bg-background`, `border-border`, `text-foreground` / `text-muted-foreground`.
   - Blocked/warned badges: keep semantic intent but ensure colors have dark contrast (e.g., `bg-destructive/10 text-destructive`, `bg-amber-500/10 text-amber-600 dark:text-amber-400`).
   - Empty state: use `text-muted-foreground`.
   - Clear button: use shadcn `Button` variant (already tokenized).

2. `DistractionLog.test.tsx`
   - Add one test asserting the rendered log does not contain hardcoded light-only classes (`bg-white`, `text-stone-900`, `border-stone-200`).

## Test Strategy
Run only this component’s tests:
`npx vitest run components/distraction/__tests__/DistractionLog.test.tsx`

## Verification Checklist
- [ ] `DistractionLog.tsx` updated.
- [ ] `DistractionLog.test.tsx` updated and passing.
- [ ] `npx tsc --noEmit` passes.
- [ ] No browser automation.
