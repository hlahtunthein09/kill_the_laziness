# Skill: Tier 2 Piece 3a — Streak Counter Store Tracking

## Goal
Track consecutive days the user meets their daily focus goal in the Zustand store.

## Files to Read
1. `lib/types/index.ts`
2. `lib/constants.ts`
3. `lib/store/slices/projectSlice.ts`
4. `lib/store/__tests__/useFocusStore.test.ts`

## Files to Create
None.

## Files to Modify
1. `lib/types/index.ts` — add streak fields to `AppSettings`.
2. `lib/constants.ts` — add default streak values.
3. `lib/store/slices/projectSlice.ts` — update `incrementProjectTime` to track streaks.
4. `lib/store/__tests__/useFocusStore.test.ts` — add streak tests.

## Implementation Details
- Add to `AppSettings`:
  - `currentStreak: number`
  - `longestStreak: number`
  - `lastStreakDate: string` (ISO date `YYYY-MM-DD`)
- Update `DEFAULT_APP_SETTINGS`:
  - `currentStreak: 0`
  - `longestStreak: 0`
  - `lastStreakDate: ""`
- In `incrementProjectTime`:
  - After updating `todayFocusSeconds`, check if goal is reached:
    - `goalReached = todayFocusSeconds + seconds >= dailyFocusGoalMinutes * 60` (or use newTodayFocus after reset logic)
  - If goal reached and `lastStreakDate` is not today:
    - Compute yesterday's date string.
    - If `lastStreakDate === yesterday`, `currentStreak += 1`.
    - Else, `currentStreak = 1`.
    - `longestStreak = Math.max(longestStreak, currentStreak)`.
    - `lastStreakDate = today`.
  - Do NOT decrement or reset streak if goal not reached today.

## Test Strategy
- Test: reaching daily goal increments `currentStreak` from 0 to 1 and sets `lastStreakDate`.
- Test: reaching goal on consecutive days increments streak.
- Test: reaching goal after a gap resets streak to 1.
- Test: multiple `incrementProjectTime` calls on the same goal-reaching day only count once.
- Test: default settings include streak fields.

Run:
1. `npx vitest run lib/store/__tests__/useFocusStore.test.ts`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `AppSettings` includes streak fields
- [ ] `DEFAULT_APP_SETTINGS` includes streak defaults
- [ ] `incrementProjectTime` increments streak when goal reached
- [ ] Streak resets after gap
- [ ] Streak only counts once per day
- [ ] Store tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 70 lines total.
- No UI in this piece — that is Piece 3b.
- Use `toISOString().slice(0, 10)` for stable date strings.
