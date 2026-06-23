# Skill: Tier 2 Piece 1b — Daily Focus Goal Dashboard UI

## Goal
Show today’s focused time and daily goal progress on the dashboard, using the store fields added in Piece 1a.

## Files to Read
1. `app/page.tsx`
2. `lib/types/index.ts`
3. `lib/constants.ts`
4. `lib/store/useFocusStore.ts` (if store shape is unclear)

## Files to Create
1. `components/analytics/DailyFocusGoal.tsx` — reusable daily goal card with progress bar.
2. `components/analytics/__tests__/DailyFocusGoal.test.tsx` — component tests.

## Files to Modify
1. `app/page.tsx` — replace the existing "Today’s Focus Time" stat card with `<DailyFocusGoal />`.

## Implementation Details
- `DailyFocusGoal` reads from `useFocusStore`:
  - `settings.todayFocusSeconds`
  - `settings.dailyFocusGoalMinutes`
- Compute:
  - `todayMinutes = Math.floor(todayFocusSeconds / 60)`
  - `goalMinutes = dailyFocusGoalMinutes`
  - `progress = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100))`
- Render Burmese-first card:
  - Title: `"နေ့စဉ် focus ရည်မှန်း (Daily Focus Goal)`"
  - Big number: `{todayMinutes} / {goalMinutes} မိနစ်`
  - Subtitle: `"{progress}% ရရှိပြီး"`
  - Visual: a horizontal progress bar (`div` with width percentage, teal bg).
- Style with existing pastel theme classes (`bg-card-glow`, `text-teal-500`, etc.).
- Use `cn()` from `lib/utils.ts` for class merging.

## Test Strategy
- Test: renders today’s minutes and goal minutes.
- Test: renders 0% progress when `todayFocusSeconds` is 0.
- Test: renders correct percentage when focus time is half the goal.
- Test: caps progress at 100% when focus exceeds the goal.
- Test: uses Burmese labels.

Run:
1. `npx vitest run components/analytics/__tests__/DailyFocusGoal.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `DailyFocusGoal` component created and uses store settings
- [ ] Dashboard page uses `<DailyFocusGoal />`
- [ ] Old "Today’s Focus Time" calculation removed
- [ ] Component tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 150 lines total.
- No new hooks or pages.
- Burmese-first labels, English subtitle.
