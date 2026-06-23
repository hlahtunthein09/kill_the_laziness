# Skill: Tier 2 Piece 1b-1 — Daily Focus Goal Component (Basic)

## Goal
Create a minimal daily focus goal component that displays today’s focused minutes and the daily goal minutes.

## Files to Read
1. `app/page.tsx`
2. `lib/types/index.ts`
3. `lib/constants.ts`

## Files to Create
1. `components/analytics/DailyFocusGoal.tsx`
2. `components/analytics/__tests__/DailyFocusGoal.test.tsx`

## Files to Modify
None.

## Implementation Details
- `DailyFocusGoal` reads from `useFocusStore`:
  - `settings.todayFocusSeconds`
  - `settings.dailyFocusGoalMinutes`
- Compute:
  - `todayMinutes = Math.floor(todayFocusSeconds / 60)`
  - `goalMinutes = dailyFocusGoalMinutes`
- Render a `Card` with:
  - Title: `"နေ့စဉ် focus ရည်မှန်း (Daily Focus Goal)`"
  - Big number: `{todayMinutes} / {goalMinutes} မိနစ်`
  - Subtitle: `"Today / Goal minutes`"
- Style with existing theme classes (`bg-card-glow`, `text-teal-500`, `text-stone-900`).
- Use `cn()` from `lib/utils.ts`.

## Test Strategy
- Test: renders today’s minutes and goal minutes from the store.
- Test: renders 0 / goal when `todayFocusSeconds` is 0.
- Test: renders Burmese title.

Run:
1. `npx vitest run components/analytics/__tests__/DailyFocusGoal.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `DailyFocusGoal` component created
- [ ] Component reads from `settings.todayFocusSeconds` and `settings.dailyFocusGoalMinutes`
- [ ] Component tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 60 lines total.
- No progress bar in this piece — that is Piece 1b-2.
- No dashboard integration in this piece — that is Piece 1b-2.
