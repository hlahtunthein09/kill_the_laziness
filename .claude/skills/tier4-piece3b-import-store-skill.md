# Skill: Tier 4 Piece 3b — Import Store from JSON

## Goal
Add a function that imports a previously exported JSON backup into the Zustand store.

## Why
Export is useless without import. Users need to load the exported JSON into another browser to restore their projects, XP, and streaks.

## Files to Read
1. `lib/sync.ts`
2. `lib/store/useFocusStore.ts`
3. `lib/types/index.ts`

## Files to Create
1. `lib/__tests__/sync.import.test.ts`

## Files to Modify
1. `lib/sync.ts`

## Implementation Details
- Add `importStore(json: string): { ok: true } | { ok: false; error: string }` to `lib/sync.ts`.
- Steps:
  1. Parse JSON.
  2. Validate top-level shape: `version` is number, `projects` is array, `settings` is object.
  3. Validate each project has required fields (`id`, `name`, etc.).
  4. Validate settings has required fields.
  5. Call `useFocusStore.setState({ projects: parsed.projects, settings: parsed.settings })`.
  6. Return `{ ok: true }`.
- On any error, return `{ ok: false, error: "Invalid backup file" }`.

## Test Strategy
Create `lib/__tests__/sync.import.test.ts`:
1. `importStore()` loads valid JSON into store.
2. `importStore()` rejects invalid JSON string.
3. `importStore()` rejects missing version.
4. `importStore()` handles partial data gracefully (fills defaults or rejects safely).

Mock `useFocusStore.setState` and `useFocusStore.getState`.

Run:
1. `npx vitest run lib/__tests__/sync.import.test.ts`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `importStore` added to `lib/sync.ts`
- [ ] Validates JSON shape and version
- [ ] Updates Zustand state
- [ ] 4 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 60 lines.
- UI comes in Pieces 3c/3d.
