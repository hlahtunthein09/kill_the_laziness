# Skill — Dark Mode SyncPanel (Piece 4c)

## Scope
Fix hardcoded light-only colors in the backup sync panel so it renders correctly in dark mode.

Modify:
- `components/settings/SyncPanel.tsx`
- `components/settings/__tests__/SyncPanel.test.tsx`

## Changes
1. `SyncPanel.tsx`
   - Title: replace `text-stone-900` with `text-foreground`.
   - Subtitles/descriptions: replace `text-stone-500` with `text-muted-foreground`.
   - Status messages (success/error): ensure `text-destructive` and a theme-friendly success color (`text-emerald-500` or `text-foreground` on `bg-success/10`).
   - Buttons: use shadcn `Button` variants (already tokenized); remove any hardcoded `bg-white` / `text-stone-*` on wrappers.
   - Card/container: rely on shadcn `Card` tokens or use `bg-card`, `border-border`, `text-card-foreground`.

2. `SyncPanel.test.tsx`
   - Add one test asserting the rendered panel does not contain hardcoded light-only classes (`bg-white`, `text-stone-900`, `border-stone-200`).

## Test Strategy
Run only this component’s tests:
`npx vitest run components/settings/__tests__/SyncPanel.test.tsx`

## Verification Checklist
- [ ] `SyncPanel.tsx` updated.
- [ ] `SyncPanel.test.tsx` updated and passing.
- [ ] `npx tsc --noEmit` passes.
- [ ] No browser automation.
