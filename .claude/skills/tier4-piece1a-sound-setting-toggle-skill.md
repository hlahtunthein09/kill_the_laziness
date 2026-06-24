# Skill: Tier 4 Piece 1a — Sound Setting + Toggle

## Goal
Add a sound-enabled setting to the app and a toggle in the settings page.

## Why
Auditory feedback helps users notice timer completion and milestones without watching the screen. The setting must exist before wiring sound playback.

## Files to Read
1. `lib/types/index.ts`
2. `lib/constants.ts`
3. `components/settings/NotificationsToggle.tsx`
4. `app/settings/page.tsx`

## Files to Create
1. `components/settings/SoundToggle.tsx`
2. `components/settings/__tests__/SoundToggle.test.tsx`

## Files to Modify
1. `lib/types/index.ts`
2. `lib/constants.ts`
3. `app/settings/page.tsx`

## Implementation Details
- Add `soundEnabled: boolean` to `AppSettings`.
- Add `soundEnabled: true` to `DEFAULT_APP_SETTINGS`.
- Create `SoundToggle` component:
  - Reads `settings.soundEnabled` from `useFocusStore`.
  - Calls `updateSettings({ soundEnabled: checked })` on change.
  - Burmese-first label: `"အသံသတိပေးချက်များ (Sound Alerts)"`.
  - Subtitle: `"အချိန်ပြည့်တိုင်း အသံပေးပါ"`.
- Add `<SoundToggle />` to `/settings` page after `NotificationsToggle`.

## Test Strategy
Create `components/settings/__tests__/SoundToggle.test.tsx`:
1. Renders Burmese label.
2. Renders English label.
3. Toggle reflects `soundEnabled` state.
4. Clicking toggle calls `updateSettings` with toggled value.

Run:
1. `npx vitest run components/settings/__tests__/SoundToggle.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `soundEnabled` added to `AppSettings` and defaults
- [ ] `SoundToggle` component created
- [ ] Toggle integrated into `/settings`
- [ ] 4 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- No sound playback yet. This is the setting only.
- Keep under 50 lines of change.
