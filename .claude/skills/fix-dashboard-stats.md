# Skill: Fix Dashboard Stats Hardcoded Values

## Goal

Replace the hardcoded `0` values on the dashboard (`app/page.tsx`) with live statistics computed from the `useFocusStore`.

## Root Cause

`app/page.tsx` is currently a server component that renders static stat cards with hardcoded values:
- Total Projects: `0`
- Today's Focus Time: `0 မိနစ်`
- Current Level: `1`

It never reads from the Zustand store, so it cannot reflect the user's actual data.

## Implementation Plan

1. Convert `app/page.tsx` to a client component:
   - Add `"use client"` at the top.
   - Import `useFocusStore` from `@/lib/store/useFocusStore`.
   - Import any needed helpers (e.g., `getLevelFromXp` from `lib/constants.ts` if it exists, otherwise compute level inline from thresholds).

2. Compute dashboard stats from store:
   - `totalProjects = projects.length`
   - `todayFocusSeconds` — for MVP, sum `project.totalTimeSeconds` across all projects (future: filter by today's date).
   - `todayFocusMinutes = Math.floor(todayFocusSeconds / 60)`
   - `currentLevel` — compute from total XP or total focus time using thresholds in `lib/constants.ts` (e.g., `LEVEL_THRESHOLDS`). If no helper exists, implement a small binary search or loop.

3. Update the three stat cards to display the computed values.

4. Keep existing UI structure, styles, and Burmese-first labels unchanged.

5. Add a test file:
   - `app/__tests__/page.test.tsx`
   - Mock `useFocusStore` with sample projects.
   - Verify that total project count, focus minutes, and level render correctly.
   - Verify empty state shows `0` values when no projects exist.

## Test Plan

- Run `npx tsc --noEmit`
- Run `npx vitest run app/__tests__/page.test.tsx`
- Run `npm test`
- Live browser verification (mandatory):
  - Navigate to `http://localhost:3000/`
  - Create a project and add a sub-piece.
  - Run the timer for a few seconds.
  - Return to dashboard and confirm:
    - Total Projects reflects the project count.
    - Today's Focus Time reflects elapsed minutes.
    - Current Level is computed from XP/focus thresholds.

## Files to Modify/Create

- `app/page.tsx`
- `app/__tests__/page.test.tsx` (new)
- `lib/constants.ts` (only if a level helper needs to be added or exported)

## Constraints

- Minimal changes; do not refactor unrelated dashboard code.
- Burmese-first UI labels must stay unchanged.
- Time values must remain in seconds internally; format only at display time.
- Do not accept completion until live browser verification passes.

## Agent Instructions

- Read `app/page.tsx`, `lib/store/useFocusStore.ts`, and `lib/constants.ts` first.
- Make `app/page.tsx` a client component and wire it to the store.
- Compute stats as described above.
- Create `app/__tests__/page.test.tsx` with at least two cases: empty state and populated state.
- Run the test commands and ensure they pass.
- Perform live browser verification with Playwright MCP and report the outcome.
