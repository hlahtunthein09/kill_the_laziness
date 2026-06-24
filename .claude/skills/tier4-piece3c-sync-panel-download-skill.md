# Skill: Tier 4 Piece 3c — SyncPanel Download UI

## Goal
Add a settings UI button to download the store backup as a JSON file.

## Why
Export function exists but users cannot trigger it without a UI button. A download button in settings makes backup easy.

## Files to Read
1. `lib/sync.ts`
2. `app/settings/page.tsx`
3. `components/settings/SoundToggle.tsx`

## Files to Create
1. `components/settings/SyncPanel.tsx`
2. `components/settings/__tests__/SyncPanel.test.tsx`

## Files to Modify
1. `app/settings/page.tsx`

## Implementation Details
- Create `components/settings/SyncPanel.tsx`:
  - Burmese-first label: `"ဆင်စစ်မှု (Backup & Restore)"`.
  - Button: `"ဆင့် JSON ဆွဲချ ရန် (Download Backup)"`.
  - On click:
    - Call `exportStore()`.
    - Create a Blob with the JSON.
    - Create a temporary anchor element with `download="focusflow-backup-<timestamp>.json"`.
    - Trigger click, then revoke object URL.
  - Use shadcn `Button` and `Card`-style container.
  - Disable button if export returns empty/no data.
- Add `<SyncPanel />` to `/settings` page.

## Test Strategy
Create `components/settings/__tests__/SyncPanel.test.tsx`:
1. Renders download button with Burmese label.
2. Clicking download creates a temporary anchor with `.json` href.
3. Button is disabled when export returns empty.

Mock `exportStore` and `URL.createObjectURL` / `URL.revokeObjectURL`.

Run:
1. `npx vitest run components/settings/__tests__/SyncPanel.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `SyncPanel.tsx` created with download button
- [ ] Download generates `.json` file
- [ ] Integrated into `/settings`
- [ ] 3 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Upload/import UI comes in Piece 3d.
- Keep under 50 lines of change.
