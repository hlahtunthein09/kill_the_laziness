# Skill: Piece 6c-a — Add Forbidden URL Form

## Goal
Add an input form to the `/settings` page for adding new forbidden URLs.

## Files to Read
1. `app/settings/page.tsx`
2. `lib/store/slices/settingsSlice.ts`
3. `lib/constants.ts`

## Files to Create
1. `components/settings/AddForbiddenUrl.tsx` — client component with input + add button.
2. `components/settings/__tests__/AddForbiddenUrl.test.tsx` — tests rendering, input change, submit, and duplicate/empty validation.

## Files to Modify
1. `app/settings/page.tsx` — replace the Forbidden URLs placeholder section with `<AddForbiddenUrl />`.

## Implementation Details
- Component must be a client component ("use client") because it uses `useFocusStore` and React state.
- Label: `"တားမြစ်ထားသော ဝဘ်ဆိုက်များ"` with English subtitle `"Forbidden URLs"`.
- Description: Burmese helper text explaining what forbidden URLs do.
- Input placeholder: `"ဥပမာ - instagram.com/reels"`.
- Button label: `"ထည့်မယ်"` / `"Add"`.
- Read `settings.forbiddenUrls` and `addForbiddenUrl` from `useFocusStore`.
- On submit:
  - Trim input.
  - Ignore empty input.
  - Show simple inline message if already exists (Burmese).
  - Call `addForbiddenUrl(input)` and clear input.
- Use existing `cn()` and `Input` + `Button` shadcn components.
- Keep component under 100 lines.

## Test Strategy
- Mock `useFocusStore`.
- Test 1: renders label, input, and add button.
- Test 2: typing in input updates the input value.
- Test 3: clicking add with valid URL calls `addForbiddenUrl` with trimmed value and clears input.
- Test 4: clicking add with empty input does NOT call `addForbiddenUrl`.
- Test 5: clicking add with duplicate URL shows Burmese error message and does NOT call `addForbiddenUrl`.

Run:
1. `npx vitest run components/settings/__tests__/AddForbiddenUrl.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `AddForbiddenUrl.tsx` created with Burmese-first labels
- [ ] Add form reads from and writes to `useFocusStore`
- [ ] `app/settings/page.tsx` renders `<AddForbiddenUrl />`
- [ ] AddForbiddenUrl tests pass (5/5)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] No other settings pieces modified

## Notes
- Duplicate check should be case-insensitive (store already lowercases URLs).
- This is intentionally just the add form; the list will be added in 6c-b.
