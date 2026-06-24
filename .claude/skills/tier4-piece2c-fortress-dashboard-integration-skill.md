# Skill: Tier 4 Piece 2c — Fortress Dashboard Integration

## Goal
Show the fortress visualization on the dashboard.

## Why
`FortressSvg` exists but is not rendered anywhere. Users need to see their fortress next to their level stat on the dashboard.

## Files to Read
1. `app/page.tsx`
2. `app/__tests__/page.test.tsx`
3. `components/fortress/FortressSvg.tsx`

## Files to Create
1. `app/__tests__/page.fortress.test.tsx`

## Files to Modify
1. `app/page.tsx`

## Implementation Details
- Modify `app/page.tsx`:
  - Find the active project via `useFocusStore((s) => s.projects.find((p) => p.id === s.activeProjectId))`.
  - If no active project, fall back to the first project.
  - Add a Fortress card in the stat grid or below it.
  - Use shadcn `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`.
  - Render `<FortressSvg level={project.fortressLevel} health={project.fortressHealth} />`.
  - Burmese label: `"ခံတပ် (Fortress)"`.
  - Show project name as subtitle.

## Test Strategy
Create `app/__tests__/page.fortress.test.tsx`:
1. Dashboard renders Fortress card.
2. Fortress card shows active project's fortress level.
3. Fortress card falls back to first project when none is active.

Run:
1. `npx vitest run app/__tests__/page.fortress.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Fortress card added to dashboard
- [ ] Shows active/first project fortress
- [ ] 3 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 50 lines of change.
- Don't break existing dashboard stats.
