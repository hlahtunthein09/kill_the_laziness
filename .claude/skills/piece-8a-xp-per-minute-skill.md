# Skill: Piece 8a — XP Per Minute

## Goal
Reward focused time by adding XP to the active project every minute.

## Files to Read
1. `lib/store/slices/projectSlice.ts`
2. `lib/constants.ts`
3. `lib/store/__tests__/useFocusStore.test.ts`

## Files to Create
None.

## Files to Modify
1. `lib/store/slices/projectSlice.ts` — update `incrementProjectTime` to also add XP.
2. `lib/store/__tests__/useFocusStore.test.ts` — add test verifying XP increments with time.

## Implementation Details
- Import `XP_PER_MINUTE` from `lib/constants.ts`.
- In `incrementProjectTime`, after adding `seconds` to `totalTimeSeconds`, compute XP to add:
  - `const xpToAdd = Math.floor(seconds / 60) * XP_PER_MINUTE`
- Add `xpToAdd` to the project's `xp` field.
- Use `Math.floor(seconds / 60)` so partial minutes don't grant XP until a full minute accumulates.
- Keep existing behavior for `totalTimeSeconds` unchanged.

## Test Strategy
- Use the existing `useFocusStore` test file pattern.
- Test: create a project, call `incrementProjectTime(projectId, 120)` (2 minutes), assert `project.xp` equals `2 * XP_PER_MINUTE`.
- Test: call `incrementProjectTime(projectId, 30)` (30 seconds), assert `project.xp` is 0 (no full minute yet).

Run:
1. `npx vitest run lib/store/__tests__/useFocusStore.test.ts`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `incrementProjectTime` adds XP per full minute
- [ ] `XP_PER_MINUTE` imported and used
- [ ] Store tests pass (existing + new)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep changes under 25 lines.
- Do not add new slice or new store.
- Dashboard `currentLevel` will automatically update because it reads `project.xp`.
