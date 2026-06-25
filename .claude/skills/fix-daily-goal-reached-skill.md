# Skill: Fix DailyFocusGoal "Goal reached" Text at 50% (Issue #7)

## Scope
Fix the `DailyFocusGoal` component so that "(Goal reached)" only appears when progress is 100% or more, not at every percentage.

## Root Cause
The subtitle text on line 45 hard-codes `(Goal reached)` regardless of the actual progress value.

## Files
- `components/analytics/DailyFocusGoal.tsx` (line 45)
- `components/analytics/__tests__/DailyFocusGoal.test.tsx` (lines 44, 59, 74, 90)

## Changes
1. In `DailyFocusGoal.tsx`, change the subtitle to conditionally render the goal-reached label:
   ```tsx
   <p className="text-xs text-stone-400">
     {progress}% achieved
     {progress >= 100 && " (Goal reached)"}
   </p>
   ```
2. Update `DailyFocusGoal.test.tsx` assertions so that only the 100% case expects `(Goal reached)`, and other cases expect just `X% achieved`.

## Test Strategy
- Run `npx vitest run components/analytics/__tests__/DailyFocusGoal.test.tsx`
- Expect 6/6 tests passing.
- Run `npx tsc --noEmit`.

## Verification
- No UI structure change; only conditional label text.
- No browser verification required.
