# Skill: Piece 6b — Strict Mode Toggle

## Goal
Add a working strict-mode toggle to the `/settings` page.

## Files to Read
1. `app/settings/page.tsx`
2. `lib/store/slices/settingsSlice.ts`
3. `lib/types/index.ts`

## Files to Create
1. `components/settings/StrictModeToggle.tsx` — client component that reads/writes `settings.strictMode`.
2. `components/settings/__tests__/StrictModeToggle.test.tsx` — tests rendering, checked state, and toggle interaction.

## Files to Modify
1. `app/settings/page.tsx` — replace the Strict Mode placeholder with `<StrictModeToggle />`.

## Implementation Details
- Component must be a client component ("use client") because it uses `useFocusStore`.
- Use a native checkbox styled as a toggle switch with Tailwind (no new shadcn dependency).
- Label: `"အထူးသတိပြုရန် မုဒ်"` with English subtitle `"Strict Mode"`.
- Description: Burmese helper text explaining strict mode redirects forbidden URLs to blocked page.
- Read `settings.strictMode` from `useFocusStore((s) => s.settings)`.
- Call `updateSettings({ strictMode: !settings.strictMode })` on change.
- Use the pastel theme colors (teal-500 for active).

## Test Strategy
- Mock `useFocusStore` so tests don't need the real Zustand store.
- Test 1: renders label and unchecked by default.
- Test 2: renders checked when `strictMode: true`.
- Test 3: clicking toggle calls `updateSettings` with toggled value.

Run:
1. `npx vitest run components/settings/__tests__/StrictModeToggle.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `StrictModeToggle.tsx` created with Burmese-first labels
- [ ] Toggle reads from and writes to `useFocusStore`
- [ ] `app/settings/page.tsx` renders `<StrictModeToggle />`
- [ ] Strict mode tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] No other settings pieces modified

## Notes
- Keep component under 100 lines.
- Use existing `cn()` utility for class merging.
