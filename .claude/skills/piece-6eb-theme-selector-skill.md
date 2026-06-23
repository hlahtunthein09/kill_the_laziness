# Skill: Piece 6e-b — Theme Selector

## Goal
Add a working light/dark/system theme selector to the `/settings` page and sync it with `next-themes`.

## Files to Read
1. `app/settings/page.tsx`
2. `lib/store/slices/settingsSlice.ts`
3. `lib/types/index.ts`
4. `components/providers/ThemeProvider.tsx` (from Piece 6e-a)

## Files to Create
1. `components/settings/ThemeSelector.tsx` — client component with light/dark/system options.
2. `components/settings/__tests__/ThemeSelector.test.tsx` — tests rendering, default selection, and change handling.

## Files to Modify
1. `app/settings/page.tsx` — replace the "အပြင်အဆင် / Theme" placeholder with `<ThemeSelector />`.

## Implementation Details
- Component must be a client component ("use client") because it uses `useFocusStore` and `useTheme`.
- Use three selectable options: `light`, `dark`, `system`.
- Label: `"အပြင်အဆင်"` with English subtitle `"Theme"`.
- Description: Burmese helper text explaining the selector changes the app appearance.
- Read `settings.theme` from `useFocusStore((s) => s.settings)`.
- Call `useTheme()` from `next-themes` to get `setTheme`.
- On user selection:
  1. Call `updateSettings({ theme: value })` to persist to Zustand store.
  2. Call `setTheme(value)` to apply the theme immediately via next-themes.
- Use shadcn/ui `Select` primitive for consistent UI (already available in the project).
- Use Lucide icons for each option: `Sun`, `Moon`, `Monitor`.

## Test Strategy
- Mock `useFocusStore` and `next-themes` so tests don't need the real store or DOM theme APIs.
- Test 1: renders label and current theme from store.
- Test 2: selecting a different theme calls `updateSettings` with the new theme value.
- Test 3: selecting a different theme calls `setTheme` from `next-themes` with the new theme value.

Run:
1. `npx vitest run components/settings/__tests__/ThemeSelector.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `ThemeSelector.tsx` created with Burmese-first labels
- [ ] Selector reads from `useFocusStore` and applies theme via `useTheme`
- [ ] `app/settings/page.tsx` renders `<ThemeSelector />`
- [ ] Theme selector tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Theme provider from Piece 6e-a is reused, not duplicated

## Notes
- Keep component under 100 lines.
- Avoid directly mutating `next-themes` internal state; only use the public `setTheme` API.
- If shadcn/ui `Select` import fails, fall back to a native `<select>` styled with Tailwind.
