# Skill: Piece 6c-b — Forbidden URLs List with Remove/Reset

## Goal
Add a list component to the `/settings` page for viewing, removing, and resetting forbidden URLs.

## Files to Read
1. `app/settings/page.tsx`
2. `components/settings/AddForbiddenUrl.tsx`
3. `lib/store/slices/settingsSlice.ts`

## Files to Create
1. `components/settings/ForbiddenUrlsList.tsx` — client component displaying forbidden URLs with remove buttons and a reset button.
2. `components/settings/__tests__/ForbiddenUrlsList.test.tsx` — tests rendering, remove, and reset behavior.

## Files to Modify
1. `app/settings/page.tsx` — render `<ForbiddenUrlsList />` below `<AddForbiddenUrl />` in the Forbidden URLs section.

## Implementation Details
- Component must be a client component ("use client") because it uses `useFocusStore`.
- Read `settings.forbiddenUrls`, `removeForbiddenUrl`, and `resetForbiddenUrls` from `useFocusStore`.
- Empty state: Burmese message `"တားမြစ်ထားသော ဝဘ်ဆိုက်များ မရှိသေးပါ။"` / `"No forbidden URLs yet."`.
- List item: URL text + remove button (`"ဖယ်ရှား"` / `"Remove"`).
- Reset button: `"မူလသတ်မှတ်ချက်များအရ ပြန်ထားရန်"` / `"Reset to Defaults"`.
- Use existing `Button` shadcn component and `cn()` utility.
- Keep component under 100 lines.

## Test Strategy
- Mock `useFocusStore`.
- Test 1: renders empty state when no forbidden URLs.
- Test 2: renders list of URLs when URLs exist.
- Test 3: clicking remove button calls `removeForbiddenUrl(url)`.
- Test 4: clicking reset button calls `resetForbiddenUrls()`.

Run:
1. `npx vitest run components/settings/__tests__/ForbiddenUrlsList.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `ForbiddenUrlsList.tsx` created with Burmese-first labels
- [ ] List reads from and writes to `useFocusStore`
- [ ] `app/settings/page.tsx` renders `<ForbiddenUrlsList />`
- [ ] ForbiddenUrlsList tests pass (4/4)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] `AddForbiddenUrl.tsx` left unchanged

## Notes
- `AddForbiddenUrl.tsx` already shows read-only URL chips; this piece adds the interactive list below it.
- Both components can coexist on the page for now.
