# Skill — Dark Mode Layout Shell (Piece 2)

## Scope
Fix hardcoded light-only colors in the global layout shell so it renders correctly in dark mode.

Modify:
- `components/layout/AppShell.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/Header.tsx`

Add/update tests:
- `components/layout/__tests__/AppShell.test.tsx`
- `components/layout/__tests__/Sidebar.test.tsx`
- Update `components/layout/__tests__/Header.test.tsx` if class assertions are needed.

## Changes
1. `AppShell.tsx`
   - Sidebar background: replace `bg-teal-50/80` with `bg-sidebar`.
   - Keep `border-border`, `bg-background`, `text-foreground` where already used.

2. `Sidebar.tsx`
   - Brand title: `text-foreground`.
   - Active nav item: use `bg-primary/10 text-primary` and icon `text-primary`.
   - Inactive nav item: `text-muted-foreground hover:bg-muted hover:text-foreground`.
   - English subtitle: `text-muted-foreground/60`.
   - Footer text: `text-muted-foreground/60`.
   - Logo badge can stay `bg-primary text-primary-foreground`.

3. `Header.tsx`
   - Header bar: replace `bg-white/80` with `bg-card/80`.
   - Title: `text-foreground`.
   - Streak badge: use a dark-safe amber style such as `bg-amber-500/10 border-amber-500/20 text-amber-600 dark:bg-amber-400/10 dark:border-amber-400/20 dark:text-amber-400`.

## Test Strategy
- `AppShell.test.tsx`: render `<AppShell>children</AppShell>`, assert the sidebar has `bg-sidebar`, the header has `bg-card/80`, and the main area has `bg-background`.
- `Sidebar.test.tsx`: render with the existing navigation mock, assert nav items render, and the active item uses primary tokens (`bg-primary`, `text-primary`) while inactive items use muted tokens.
- `Header.test.tsx`: assert the title has `text-foreground` and the streak badge does not contain hardcoded light-only classes like `bg-white` or `text-stone-900`.

Run only the layout test files during agent work:
`npx vitest run components/layout/__tests__/AppShell.test.tsx components/layout/__tests__/Sidebar.test.tsx components/layout/__tests__/Header.test.tsx`

## Verification Checklist
- [ ] `AppShell.tsx`, `Sidebar.tsx`, `Header.tsx` updated.
- [ ] Layout tests created/updated and passing.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes (run after the agent, before user review).
- [ ] No browser automation.
