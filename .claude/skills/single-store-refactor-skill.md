# Skill: Single Store Refactor with Zustand Slices

## Purpose
Refactor multiple separate Zustand stores into one combined `useFocusStore` using the slices pattern.

## When to Use
When the codebase has grown multiple stores and we want one unified store for easier cross-domain actions and extension sync.

## References Studied

### Zustand Slices Pattern (Context7 `/pmndrs/zustand`)
Source: https://github.com/pmndrs/zustand/blob/main/docs/learn/guides/slices-pattern.md

Key pattern:

```typescript
import { create, StateCreator } from 'zustand'

const createBearSlice: StateCreator<BearSlice & FishSlice, [], [], BearSlice> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
})

const useBoundStore = create<BearSlice & FishSlice & SharedSlice>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
  ...createSharedSlice(...a),
}))
```

### Zustand Persist with Slices (Context7 `/pmndrs/zustand`)
Source: https://github.com/pmndrs/zustand/blob/main/docs/reference/integrations/persisting-store-data.md

Persist middleware wraps the combined store:

```typescript
import { persist, createJSONStorage } from 'zustand/middleware'

export const useFocusStore = create<FocusState>()(
  persist(
    (...a) => ({
      ...createProjectSlice(...a),
      ...createSettingsSlice(...a),
      ...createDistractionSlice(...a),
    }),
    {
      name: 'ff_focus_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

## Steps

1. Read existing stores: `useProjectStore.ts`, `useSettingsStore.ts`, `useDistractionStore.ts`.
2. Create `lib/store/slices/projectSlice.ts` with `StateCreator<FocusState, [], [], ProjectSlice>`.
3. Create `lib/store/slices/settingsSlice.ts`.
4. Create `lib/store/slices/distractionSlice.ts`.
5. Create `lib/store/useFocusStore.ts` combining all slices with `persist`.
6. Update any files importing old stores to import from `useFocusStore`.
7. Delete old store files.
8. Run `npx tsc --noEmit`.
9. Update `.claude/memory/progress.md`.

## Rules

- One store only: `useFocusStore`.
- Each slice is in its own file under `lib/store/slices/`.
- Combined type is `FocusState = ProjectSlice & SettingsSlice & DistractionSlice`.
- Persist key: `ff_focus_store`.
- Cross-slice actions use `get()` to access other slices.
- No `any` types.

## Verification

- `npx tsc --noEmit` passes.
- No remaining imports from deleted store files.
- `npm run dev` starts.
- Store data persists after reload.
