# Skill: Tier 4 Piece 3a — Export Store to JSON

## Goal
Add a function that exports the current Zustand store state to a JSON string.

## Why
Cross-device sync starts with getting data out of the current browser. A JSON export is the simplest, backend-free first step.

## Files to Read
1. `lib/store/useFocusStore.ts`
2. `lib/types/index.ts`

## Files to Create
1. `lib/sync.ts`
2. `lib/__tests__/sync.export.test.ts`

## Files to Modify
None.

## Implementation Details
- Create `lib/sync.ts`:
  - `exportStore(): string` — reads `useFocusStore.getState()` and returns `JSON.stringify(state, null, 2)`.
  - The exported object should include `projects` and `settings`.
  - Optionally include a version field for future migrations: `{ version: 1, exportedAt: Date.now(), projects, settings }`.
- No UI in this piece.

## Test Strategy
Create `lib/__tests__/sync.export.test.ts`:
1. `exportStore()` returns valid JSON.
2. Exported JSON contains `projects` array.
3. Exported JSON contains `settings` object.
4. Export includes version and timestamp.

Use a mock store state (do not rely on actual localStorage persistence in tests).

Run:
1. `npx vitest run lib/__tests__/sync.export.test.ts`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `lib/sync.ts` created with `exportStore`
- [ ] Export includes projects, settings, version, timestamp
- [ ] 4 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 40 lines.
- No UI, no import logic yet.
