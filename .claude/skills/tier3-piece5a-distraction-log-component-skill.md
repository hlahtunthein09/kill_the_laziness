# Skill: Tier 3 Piece 5a — DistractionLog Component

## Goal
Create a component that displays the anti-distraction logs from the store.

## Files to Read
1. `lib/store/slices/distractionSlice.ts`
2. `lib/types/index.ts`
3. `components/analytics/DailyFocusGoal.tsx` (reference card style)

## Files to Create
1. `components/distraction/DistractionLog.tsx`
2. `components/distraction/__tests__/DistractionLog.test.tsx`

## Files to Modify
None.

## Implementation Details
- `DistractionLog` reads from `useFocusStore`:
  - `logs`
  - `clearLogs`
- Render a `Card` with:
  - Title: `"အာရုံစားသမျှမှတ်တမ်း (Distraction Log)`"
  - List of logs showing:
    - URL (truncated if long)
    - Action badge: `"တားမြစ်ခဲ့သည် (Blocked)`" or `"သတိပေးခဲ့သည် (Warned)`"
    - Time ago (e.g., `"ယခုလတ်တလော (Just now)`" or use `formatDuration` from `lib/time.ts`)
  - Empty state: `"အခုထိ အာရုံစားမှု မရှိသေးပါ (No distractions logged yet)`"
  - Clear button: `"မှတ်တမ်းရှင်းလင်းရန် (Clear)`" — calls `clearLogs()`
- Use theme classes (`bg-card-glow`, `text-stone-900`, `text-red-500` for blocked, `text-amber-500` for warned).
- Use `cn()` from `lib/utils.ts`.

## Test Strategy
- Test: renders log entries with URL and action.
- Test: renders empty state when logs array is empty.
- Test: calls `clearLogs` when clear button clicked.
- Test: renders Burmese title.

Run:
1. `npx vitest run components/distraction/__tests__/DistractionLog.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `DistractionLog` component created
- [ ] Component reads `logs` and `clearLogs` from store
- [ ] Empty state rendered when no logs
- [ ] Clear button works
- [ ] Component tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 60 lines total.
- No page integration in this piece — that is Piece 5b.
- Burmese-first labels, English subtitle.
