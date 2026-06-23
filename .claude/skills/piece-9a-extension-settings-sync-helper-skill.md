# Skill: Piece 9a — Extension Settings Sync Helper

## Goal
Create a helper in the extension to read/write settings so the web app can sync its settings to the extension later.

## Files to Read
1. `extension/lib/storage.ts` (pattern for browser storage wrapper)
2. `extension/lib/types.ts`
3. `lib/types/index.ts` (for `AppSettings` shape)
4. `lib/constants.ts` (for `DEFAULT_FORBIDDEN_URLS`)

## Files to Create
1. `extension/lib/settingsSync.ts` — read/write extension settings with validation.
2. `extension/lib/__tests__/settingsSync.test.ts` — tests for read/write/defaults/validation.

## Files to Modify
None.

## Implementation Details
- Create `ExtensionSettings` interface with:
  - `strictMode?: boolean`
  - `forbiddenUrls?: string[]`
- Storage key: `ff_extension_settings`.
- Provide swappable browser instance pattern (same as `storage.ts`):
  - `setSettingsBrowserInstance(browser)` for tests/production injection.
  - `getBrowser()` lazy dynamic import fallback.
- `setExtensionSettings(settings)`:
  - Validates `strictMode` is boolean if present.
  - Validates `forbiddenUrls` is array of strings if present.
  - Writes to `browser.storage.local` under `ff_extension_settings`.
- `getExtensionSettings()`:
  - Reads from `browser.storage.local`.
  - Returns `null` if not found.
- `getExtensionSettingsWithDefaults()`:
  - Returns merged object with defaults:
    - `strictMode: false` (match web app default)
    - `forbiddenUrls: DEFAULT_FORBIDDEN_URLS`

## Test Strategy
- Mock `browser.storage.local` via swappable instance.
- Test 1: `setExtensionSettings` writes valid settings.
- Test 2: `getExtensionSettings` returns stored settings.
- Test 3: `getExtensionSettingsWithDefaults` fills missing fields.
- Test 4: invalid payloads are rejected or sanitized.

Run:
1. `npx vitest run extension/lib/__tests__/settingsSync.test.ts`
2. `npx tsc --noEmit`
3. `npm run build:ext`

## Verification Checklist
- [ ] `extension/lib/settingsSync.ts` created
- [ ] `ExtensionSettings` type defined
- [ ] Read/write functions use swappable browser instance
- [ ] Default fallback uses `DEFAULT_FORBIDDEN_URLS`
- [ ] Settings sync tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds

## Notes
- Keep under 100 lines total.
- Do not wire to web app yet — that is Piece 9b.
- Follow the same patterns as `extension/lib/storage.ts`.
