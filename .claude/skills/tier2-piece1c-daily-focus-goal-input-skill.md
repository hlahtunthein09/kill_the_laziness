# Skill: Tier 2 Piece 1c — Daily Focus Goal Setting Input

## Goal
Let the user customize the daily focus goal minutes from the `/settings` page.

## Files to Read
1. `app/settings/page.tsx`
2. `components/settings/StrictModeToggle.tsx` (reference for settings component pattern)
3. `lib/constants.ts`

## Files to Create
1. `components/settings/DailyFocusGoalInput.tsx`
2. `components/settings/__tests__/DailyFocusGoalInput.test.tsx`

## Files to Modify
1. `app/settings/page.tsx` — add the new input component to the settings layout.

## Implementation Details
- `DailyFocusGoalInput` reads `settings.dailyFocusGoalMinutes` from `useFocusStore`.
- Calls `updateSettings({ dailyFocusGoalMinutes: value })` on change/blur.
- Use a native number `input` with:
  - `min={15}`
  - `max={480}`
  - `step={5}`
- Label: `"နေ့စဉ် focus ရည်မှန်းချိန် (Daily Focus Goal in minutes)`"
- Helper text: `"တစ်နေ့ focus လုပ်မယ့်အချိန် မိနစ်ဖြင့် သတ်မှတ်ပါ`"
- Style with shadcn/ui `Input` and `Label` if available; otherwise native input with theme classes.
- Clamp value to [15, 480] before saving.

## Test Strategy
- Test: renders current `dailyFocusGoalMinutes` value.
- Test: changing input updates store via `updateSettings`.
- Test: value below min is clamped to 15.
- Test: value above max is clamped to 480.

Run:
1. `npx vitest run components/settings/__tests__/DailyFocusGoalInput.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `DailyFocusGoalInput` component created
- [ ] Component reads and updates `settings.dailyFocusGoalMinutes`
- [ ] Min/max clamping works
- [ ] Settings page renders the input
- [ ] Tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 60 lines total.
- No new hooks or pages.
- Burmese-first labels, English subtitle.
