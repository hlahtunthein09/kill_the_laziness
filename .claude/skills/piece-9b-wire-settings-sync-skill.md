# Skill: Piece 9b — Wire Web App Settings to Extension Sync

## Goal
Sync web app settings (strict mode + forbidden URLs) to the extension so blocking behavior matches the web app.

## Files to Read
1. `extension/lib/focusSync.ts`
2. `extension/entrypoints/focusSync.content.ts`
3. `extension/lib/settingsSync.ts` (from Piece 9a)
4. `extension/lib/__tests__/focusSync.test.ts`
5. `lib/store/useFocusStore.ts` (to confirm storage key `ff_focus_store`)

## Files to Create
None.

## Files to Modify
1. `extension/lib/focusSync.ts` — add `syncExtensionSettings()` helper.
2. `extension/entrypoints/focusSync.content.ts` — poll settings sync alongside timer sync.
3. `extension/lib/__tests__/focusSync.test.ts` — add test for settings sync.

## Implementation Details
- Add `syncExtensionSettings()` to `extension/lib/focusSync.ts`:
  - Read `ff_focus_store` from `window.localStorage`.
  - Parse the JSON safely; return early if missing/corrupt.
  - Extract `settings.strictMode` and `settings.forbiddenUrls`.
  - Call `setExtensionSettings({ strictMode, forbiddenUrls })` from `extension/lib/settingsSync.ts`.
  - Catch and log errors without throwing.
- In `extension/entrypoints/focusSync.content.ts`:
  - Call `syncExtensionSettings()` inside the existing poll interval.
  - Keep timer sync unchanged.
- Update tests in `extension/lib/__tests__/focusSync.test.ts`:
  - Mock `localStorage` with a fake `ff_focus_store` containing settings.
  - Mock `setExtensionSettings` from `settingsSync.ts`.
  - Assert `setExtensionSettings` is called with the expected values.

## Test Strategy
- Test 1: `syncExtensionSettings` reads `ff_focus_store` and calls `setExtensionSettings` with `strictMode` and `forbiddenUrls`.
- Test 2: missing or corrupt `ff_focus_store` does not crash and does not call `setExtensionSettings`.
- Test 3: partial settings (only strictMode) still sync.

Run:
1. `npx vitest run extension/lib/__tests__/focusSync.test.ts`
2. `npx tsc --noEmit`
3. `npm run build:ext`

## Verification Checklist
- [ ] `syncExtensionSettings` reads web app store and syncs to extension
- [ ] `focusSync.content.ts` polls settings sync
- [ ] `focusSync.test.ts` covers settings sync
- [ ] Extension tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds

## Notes
- Keep under 80 lines total.
- Reuse the existing polling interval from `focusSync.content.ts`.
- Do not create a new content script entrypoint.
