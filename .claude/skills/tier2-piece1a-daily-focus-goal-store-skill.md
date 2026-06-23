# Skill: Tier 2 Piece 1a — Daily Focus Goal Store Tracking

## Goal
Track today's focused time and daily goal in the Zustand store so the dashboard can show progress.

## Files to Read
1. `lib/types/index.ts`
2. `lib/constants.ts`
3. `lib/store/slices/projectSlice.ts`
4. `lib/store/__tests__/useFocusStore.test.ts`

## Files to Create
None.

## Files to Modify
1. `lib/types/index.ts` — add daily focus fields to `AppSettings`.
2. `lib/constants.ts` — add defaults for daily focus goal.
3. `lib/store/slices/projectSlice.ts` — update `incrementProjectTime` to track daily focus.
4. `lib/store/__tests__/useFocusStore.test.ts` — add tests for daily tracking.

## Implementation Details
- Add to `AppSettings`:
  - `dailyFocusGoalMinutes: number`
  - `todayFocusSeconds: number`
  - `lastFocusDate: string` (ISO date `YYYY-MM-DD`)
- Update `DEFAULT_APP_SETTINGS` in `lib/constants.ts`:
  - `dailyFocusGoalMinutes: 60`
  - `todayFocusSeconds: 0`
  - `lastFocusDate: ""`
- In `incrementProjectTime`:
  - Compute `today = new Date().toISOString().slice(0, 10)`.
  - Determine if `lastFocusDate` differs from `today`:
    - If different, reset `todayFocusSeconds = 0`.
  - Add `seconds` to `todayFocusSeconds`.
  - Set `lastFocusDate = today`.
  - Update `settings` in the same `set()` call that updates the project.

## Test Strategy
- Test: `incrementProjectTime` adds seconds to `todayFocusSeconds` when `lastFocusDate` is today.
- Test: `incrementProjectTime` resets `todayFocusSeconds` and starts from `seconds` when `lastFocusDate` is yesterday.
- Test: default settings include `dailyFocusGoalMinutes`, `todayFocusSeconds`, and `lastFocusDate`.

Run:
1. `npx vitest run lib/store/__tests__/useFocusStore.test.ts`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `AppSettings` includes daily focus fields
- [ ] `DEFAULT_APP_SETTINGS` includes daily focus defaults
- [ ] `incrementProjectTime` updates `todayFocusSeconds`
- [ ] Date change resets `todayFocusSeconds`
- [ ] Store tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 60 lines.
- No dashboard UI in this piece — that is Piece 1b.
- Use `toISOString().slice(0, 10)` for stable date string format in tests.
