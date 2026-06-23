# Skill: Tier 1 Piece 3 — Default Project Auto-Creation

## Goal
Ensure first-time users always have a project to focus on, so they can start using the timer immediately without understanding project creation.

## Files to Read
1. `components/providers/StoreHydrationProvider.tsx`
2. `lib/store/slices/projectSlice.ts` (for `addProject` signature)
3. `lib/store/useFocusStore.ts` (for store access pattern)

## Files to Create
1. `components/providers/__tests__/StoreHydrationProvider.test.tsx` — test default project creation.

## Files to Modify
1. `components/providers/StoreHydrationProvider.tsx` — auto-create default project after hydration if none exist.

## Implementation Details
- After `persist.rehydrate()` resolves and `hasHydrated` becomes true, check `useFocusStore.getState().projects`.
- If `projects.length === 0`, create a default project:
  ```ts
  addProject({
    name: "Daily Focus",
    description: "Your default space for focused work",
    color: "mint",
    targetTimeSeconds: 3600, // 1 hour
  });
  ```
- `addProject` already sets `activeProjectId` automatically, so no extra step needed.
- Use Burmese-first label where possible:
  - `name`: `"နေ့စဥ် Focus နေရာ (Daily Focus)"`
  - `description`: `"အလုပ်လုပ်ရန် အသင့်တော်ဆုံး နေရာပါ"`
- Keep the provider's existing hydration behavior unchanged.

## Test Strategy
- Mock Zustand store or use the real store with `skipHydration: true` and manual rehydrate.
- Render `StoreHydrationProvider` with a callback child that reads store state.
- Wait for hydration effect to run.
- Assert:
  - A default project exists in `projects`.
  - `activeProjectId` matches the default project's id.
- Test that if projects already exist, no default project is added.

Run:
1. `npx vitest run components/providers/__tests__/StoreHydrationProvider.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Default project auto-created when projects array is empty after hydration
- [ ] `activeProjectId` set to default project
- [ ] Existing projects are not duplicated
- [ ] Hydration behavior unchanged
- [ ] StoreHydrationProvider tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 50 lines.
- Do not add a new slice or new store.
- This removes the "no project" blocker for first-time users.
