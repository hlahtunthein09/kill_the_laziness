# Skill: Tier 4 Piece 3d — SyncPanel Upload/Import UI

## Goal
Add file upload and restore backup UI to `SyncPanel`.

## Why
Download button exists but users cannot restore a backup. An upload/import button completes the cross-device sync loop.

## Files to Read
1. `components/settings/SyncPanel.tsx`
2. `components/settings/__tests__/SyncPanel.test.tsx`
3. `lib/sync.ts`

## Files to Create
None.

## Files to Modify
1. `components/settings/SyncPanel.tsx`
2. `components/settings/__tests__/SyncPanel.test.tsx`

## Implementation Details
- Modify `SyncPanel.tsx`:
  - Add a hidden file input (`type="file" accept=".json,application/json"`) with ref.
  - Add "ဆင့် JSON ပြန်တင်ရန် (Restore Backup)" button that triggers `inputRef.current?.click()`.
  - On file change:
    - Read file with `FileReader`.
    - Call `importStore(text)`.
    - Show inline success/error message (simple text below buttons).
    - Clear input value to allow re-selecting same file.
  - Success message: `"ဆင့် ပြန်တင်ပြီးပါပြီ (Backup restored)"`.
  - Error message: `"ဆင့် မမှန်ပါ (Invalid backup file)"`.

## Test Strategy
Extend `components/settings/__tests__/SyncPanel.test.tsx`:
1. Upload button/input renders.
2. Selecting valid JSON file calls `importStore` and shows success message.
3. Selecting invalid JSON shows error message.

Mock `importStore`, `FileReader`, and `URL.createObjectURL`/`revokeObjectURL`.

Run:
1. `npx vitest run components/settings/__tests__/SyncPanel.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Upload button added to `SyncPanel`
- [ ] File input triggers import
- [ ] Success/error messages shown
- [ ] 3 new tests passing (6 total)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 50 lines of change.
- No external libraries.
