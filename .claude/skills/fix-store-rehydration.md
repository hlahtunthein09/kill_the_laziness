# Skill: Fix Zustand Store Rehydration on Client Navigation

## Goal

Fix the issue where `useFocusStore` data exists in `localStorage` but components show empty state after client-side navigation (e.g., creating a project on `/`, then navigating to `/projects` shows "No projects yet"). A hard browser reload is currently required to see the data.

## Root Cause

`lib/store/useFocusStore.ts` uses Zustand's `persist` middleware with `localStorage`. On a hard reload, the store rehydrates before the first render. On client-side navigation within the Next.js App Router, the store instance is already initialized with the default empty state and does not rehydrate again, so components render with stale/empty data until the page is hard-reloaded.

## Implementation Plan

1. Modify `lib/store/useFocusStore.ts`:
   - Add `hasHydrated: boolean` to the store state.
   - Add `setHasHydrated(hasHydrated: boolean)` action.
   - In the `persist` middleware config, add `onRehydrateStorage: () => (state) => state?.setHasHydrated(true)`.
   - Ensure `hasHydrated` defaults to `false` and is persisted.

2. Create `hooks/useStoreHydrated.ts`:
   - A tiny hook that returns `useFocusStore((s) => s.hasHydrated)`.

3. Create `components/providers/StoreHydrationProvider.tsx`:
   - A client provider that waits for `hasHydrated`.
   - While not hydrated, render a non-flickering placeholder (e.g., `null` or a layout-safe spinner) so data-dependent components never see the empty default state.
   - Wrap it in `app/layout.tsx` around `{children}`.

4. Alternative minimal approach (if provider is too invasive):
   - Create a `HydrationGuard` component that data-dependent pages/components can use to wait for rehydration before rendering their main content.
   - Use it in `app/projects/page.tsx`, `app/timer/page.tsx`, and dashboard stat cards.

**Recommended approach:** Provider in `app/layout.tsx` — one change fixes all pages.

## Test Plan

1. `lib/store/__tests__/useFocusStore.test.ts`:
   - Add a test that verifies `hasHydrated` transitions to `true` after rehydration.
   - Verify that pre-existing data in `localStorage` is loaded into `projects` after rehydration.

2. `components/projects/__tests__/ProjectList.test.tsx`:
   - Update the empty-state test to set `hasHydrated: true` before asserting empty UI.
   - Add a test that verifies the list does NOT show the empty state while `hasHydrated` is `false`.

3. `app/layout.tsx` test (if provider is added):
   - Verify provider renders children after hydration.

4. Live browser verification (mandatory per updated workflow):
   - Start `npm run dev`.
   - Create a project on `/`.
   - Navigate to `/projects` via sidebar link.
   - Confirm the project appears without a hard reload.
   - Navigate to `/timer` and confirm the active project/sub-piece appear.

## Files to Modify/Create

- `lib/store/useFocusStore.ts`
- `hooks/useStoreHydrated.ts` (new)
- `components/providers/StoreHydrationProvider.tsx` (new)
- `app/layout.tsx`
- `lib/store/__tests__/useFocusStore.test.ts`
- `components/projects/__tests__/ProjectList.test.tsx`

## Constraints

- Minimal changes; do not refactor store slices.
- Keep Burmese-first UI labels unchanged.
- Avoid visible loading flash if possible (render provider placeholder as `null` or match the shell layout).
- Do not break server components; the provider must be marked `"use client"` and imported carefully.

## Agent Instructions

- Read `lib/store/useFocusStore.ts`, `app/layout.tsx`, and existing store tests first.
- Choose the provider approach unless there is a strong reason not to.
- Write the hydration provider and hook.
- Update tests as specified.
- Run:
  - `npx tsc --noEmit`
  - `npx vitest run lib/store/__tests__/useFocusStore.test.ts`
  - `npx vitest run components/projects/__tests__/ProjectList.test.tsx`
  - `npm test`
- After tests pass, perform live browser verification with Playwright MCP:
  - `mcp__playwright__browser_navigate` to `http://localhost:3000/`
  - Create a project
  - Click sidebar `/projects` link
  - Take snapshot/screenshot to confirm project appears
- Report files changed, test results, and live browser verification outcome.
