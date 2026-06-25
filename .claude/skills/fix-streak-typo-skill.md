# Skill: Fix Streak Counter Burmese Typo (Issue #9)

## Scope
Fix the Burmese typo in `StreakCounter.tsx` title and update the matching test assertion.

## Files
- `components/analytics/StreakCounter.tsx` (line 23)
- `components/analytics/__tests__/StreakCounter.test.tsx` (line 45)

## Change
- `StreakCounter.tsx`: `"အစဉ်လိုက်က် focus ရက်များ (Streak)"` → `"အစဉ်လိုက် focus ရက်များ (Streak)"`
- `StreakCounter.test.tsx`: update `getByText` assertion to match corrected spelling.

## Test Strategy
- Run `npx vitest run components/analytics/__tests__/StreakCounter.test.tsx`
- Expect 4/4 tests passing.
- Run `npx tsc --noEmit`.

## Verification
- No UI behavior change; only Burmese spelling correction.
- No browser verification required.
