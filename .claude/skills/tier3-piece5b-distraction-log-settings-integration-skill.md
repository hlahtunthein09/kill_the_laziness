# Skill: Tier 3 Piece 5b — DistractionLog Settings Integration

## Goal
Add the existing `DistractionLog` component to the `/settings` page as a new section.

## Files to Read
1. `app/settings/page.tsx`
2. `components/distraction/DistractionLog.tsx`
3. `app/__tests__/settings-page.test.tsx`

## Files to Create
None.

## Files to Modify
1. `app/settings/page.tsx`
2. `app/__tests__/settings-page.test.tsx`

## Implementation Details
- Import `DistractionLog` from `@/components/distraction/DistractionLog`.
- Add a new settings section at the bottom of the grid (after Theme selector).
- Wrap it in the same `rounded-xl border border-stone-200 bg-white p-6 shadow-sm` container as other sections.
- Section title (above the component): `"အာရုံစားသမျှမှတ်တမ်း (Distraction Log)`".
- The `DistractionLog` component already includes its own `Card`, title, and clear button.

## Test Strategy
Extend `app/__tests__/settings-page.test.tsx`:
- Test: renders the Burmese distraction log label.
- Test: renders the English "Distraction Log" label.

Run:
1. `npx vitest run app/__tests__/settings-page.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `DistractionLog` imported and rendered on `/settings`
- [ ] New section uses consistent card styling
- [ ] Settings page tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- No store changes needed.
- Keep under 40 lines total.
- Burmese-first labels, English subtitle.
