# Skill: Piece 6d — Notifications Toggle

## Goal
Add a working notifications-enabled toggle to the `/settings` page.

## Files to Read
1. `app/settings/page.tsx`
2. `lib/store/slices/settingsSlice.ts`
3. `lib/types/index.ts`
4. `components/settings/StrictModeToggle.tsx` (reference for toggle pattern)

## Files to Create
1. `components/settings/NotificationsToggle.tsx` — client component that reads/writes `settings.notificationsEnabled`.
2. `components/settings/__tests__/NotificationsToggle.test.tsx` — tests rendering, checked state, and toggle interaction.

## Files to Modify
1. `app/settings/page.tsx` — replace the "အသိပေးချက်များ / Notifications" placeholder with `<NotificationsToggle />`.

## Implementation Details
- Component must be a client component ("use client") because it uses `useFocusStore`.
- Reuse the native checkbox + toggle switch styling from `StrictModeToggle`.
- Label: `"အသိပေးချက်များ"` with English subtitle `"Notifications"`.
- Description: Burmese helper text explaining that toggling off disables toast and desktop notifications.
- Read `settings.notificationsEnabled` from `useFocusStore((s) => s.settings)`.
- Call `updateSettings({ notificationsEnabled: !settings.notificationsEnabled })` on change.
- Use the pastel theme colors (teal-500 for active).

## Test Strategy
- Mock `useFocusStore` so tests don't need the real Zustand store.
- Test 1: renders label and checked by default.
- Test 2: renders unchecked when `notificationsEnabled: false`.
- Test 3: clicking toggle calls `updateSettings` with toggled value.

Run:
1. `npx vitest run components/settings/__tests__/NotificationsToggle.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `NotificationsToggle.tsx` created with Burmese-first labels
- [ ] Toggle reads from and writes to `useFocusStore`
- [ ] `app/settings/page.tsx` renders `<NotificationsToggle />`
- [ ] Notifications toggle tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] No other settings pieces modified

## Notes
- Keep component under 80 lines.
- Use existing `cn()` utility for class merging.
