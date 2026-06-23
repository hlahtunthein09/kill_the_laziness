# Skill: Tier 2 Piece 3b — Streak Dashboard UI

## Goal
Display the user's current and longest streak on the dashboard.

## Files to Read
1. `components/analytics/DailyFocusGoal.tsx` (reference card style)
2. `app/page.tsx`
3. `lib/constants.ts`

## Files to Create
1. `components/analytics/StreakCounter.tsx`
2. `components/analytics/__tests__/StreakCounter.test.tsx`

## Files to Modify
1. `app/page.tsx` — add `<StreakCounter />` to the dashboard grid.

## Implementation Details
- `StreakCounter` reads from `useFocusStore`:
  - `settings.currentStreak`
  - `settings.longestStreak`
- Render a `Card` matching existing stat cards:
  - Title: `"အစဉ်လိုက် focus ရက်များ (Streak)`"
  - Big number: `{currentStreak}` with flame icon 🔥 (use `Flame` from lucide-react)
  - Subtitle: `"စံချိန်: {longestStreak} ရက် (Best: {longestStreak})`"
- Style with existing theme classes (`bg-card-glow`, `text-orange-500` for flame, `text-stone-900`).
- Use `cn()` from `lib/utils.ts`.

## Test Strategy
- Test: renders current streak number.
- Test: renders longest streak subtitle.
- Test: renders 0 when no streak.
- Test: renders Burmese title.

Run:
1. `npx vitest run components/analytics/__tests__/StreakCounter.test.tsx app/__tests__/page.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `StreakCounter` component created
- [ ] Component reads `currentStreak` and `longestStreak`
- [ ] Dashboard page renders `StreakCounter`
- [ ] Component tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 60 lines total.
- No new hooks or pages.
- Burmese-first labels, English subtitle.
