# Skill: Core Data Layer Build

## Purpose
Build the foundational data model and Zustand stores for FocusFlow AI.

## When to Use
Starting a new piece that needs Project, SubPiece, or settings state.

## References Studied

### 1. Zustand Persist Middleware (Context7: `/pmndrs/zustand`)
Source: https://github.com/pmndrs/zustand/blob/main/docs/reference/integrations/persisting-store-data.md

Key pattern for TypeScript persistence:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface BearState {
  bears: number
  increase: () => void
}

export const useBearStore = create<BearState>()(
  persist(
    (set) => ({
      bears: 0,
      increase: () => set((s) => ({ bears: s.bears + 1 })),
    }),
    {
      name: 'bear-storage', // localStorage key
      storage: createJSONStorage(() => localStorage), // default is localStorage
      partialize: (state) => ({ bears: state.bears }), // optional: persist only specific fields
    },
  ),
)
```

Hydration control:

```typescript
await useBoundStore.persist.rehydrate()
```

### 2. Next.js App Router Client Components (Context7: `/vercel/next.js`)
- Components that use Zustand stores or `localStorage` must use `"use client"` directive.
- Use lazy state initialization in `useState` to avoid hydration mismatches.
- Use `suppressHydrationWarning` on elements that differ between server and client.

## Steps

1. Read `.claude/CLAUDE.md` and current `lib/types/`.
2. Define/update TypeScript types in `lib/types/index.ts`.
3. Create Zustand store with `persist` middleware in `lib/store/`.
4. Add CRUD actions, selectors, and computed helpers.
5. Run `npx tsc --noEmit` and fix errors.
6. Update `.claude/memory/progress.md`.

## Rules

- Storage keys must use `ff_` prefix (e.g., `ff_projects`).
- Time values stored in seconds.
- Client components only when consuming stores.
- No `any` types.
- Use `persist` middleware for automatic localStorage persistence.

## Verification

- TypeScript compiles.
- Store actions can be called from a test component.
- Data persists to localStorage after page reload.
