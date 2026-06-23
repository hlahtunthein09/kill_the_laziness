# Skill: Tier 2 Piece 1b-2 — Daily Focus Goal Progress + Dashboard Integration

## Goal
Add a progress bar to the daily focus goal component and integrate it into the dashboard page.

## Files to Read
1. `components/analytics/DailyFocusGoal.tsx`
2. `components/analytics/__tests__/DailyFocusGoal.test.tsx`
3. `app/page.tsx`

## Files to Create
None.

## Files to Modify
1. `components/analytics/DailyFocusGoal.tsx` — add progress bar and percentage.
2. `components/analytics/__tests__/DailyFocusGoal.test.tsx` — add progress tests.
3. `app/page.tsx` — replace today’s focus time card with `<DailyFocusGoal />`.

## Implementation Details
- In `DailyFocusGoal`:
  - Compute `progress = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100))`.
  - Render a horizontal progress bar track (`bg-stone-200 rounded-full h-2.5`) with fill (`bg-teal-500 h-2.5 rounded-full`) width set to `{progress}%`.
  - Subtitle: `"{progress}% ရရှိပြီး (Goal reached)`".
- In `app/page.tsx`:
  - Remove the existing “ယနေ့ focus အချိန်” stat card (the one that sums `project.totalTimeSeconds`).
  - Import and render `<DailyFocusGoal />` in its place.
  - Keep the other two stat cards unchanged.

## Test Strategy
- Test: renders 50% progress when today is half the goal.
- Test: caps progress at 100% when today exceeds the goal.
- Test: renders 0% progress when `todayFocusSeconds` is 0.
- Test (page): dashboard renders `<DailyFocusGoal />` after integration.

Run:
1. `npx vitest run components/analytics/__tests__/DailyFocusGoal.test.tsx app/__tests__/page.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `DailyFocusGoal` shows progress bar and percentage
- [ ] Progress caps at 100%
- [ ] `app/page.tsx` uses `<DailyFocusGoal />`
- [ ] Old today-focus calculation removed
- [ ] Component and page tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 60 lines total.
- No new hooks or pages.
- Burmese-first labels, English subtitle.
