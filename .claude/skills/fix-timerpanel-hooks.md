# Skill: Fix TimerPanel Conditional Hooks Crash

## Goal

Fix the React "Rules of Hooks" runtime crash in `components/timer/TimerPanel.tsx` that occurs when `activeProject` transitions from `undefined` to a project (e.g., after Zustand rehydration or navigation).

## Root Cause

`TimerPanel` currently:
1. Calls two `useFocusStore` selectors.
2. Returns early if `activeProject` is missing.
3. Returns early if no incomplete sub-piece exists.
4. Only then calls `useTimer(...)`.

When the component re-renders with an active project after previously returning early, the number of hooks changes between renders, violating React's Rules of Hooks and crashing the page.

## Implementation Plan

1. Modify `components/timer/TimerPanel.tsx`:
   - Keep `useFocusStore` selector calls at the top.
   - Call `useTimer(activeProject?.id, firstIncompleteSubPiece?.id)` unconditionally before any conditional returns.
   - Pass `undefined` IDs when no project/sub-piece is active; `useTimer` must handle nullable IDs gracefully (return neutral values and no-op handlers).
   - Move the empty-state UI branches after all hook calls.

2. Update `hooks/useTimer.ts` if needed:
   - Accept `projectId: string | undefined` and `subPieceId?: string`.
   - When `projectId` is undefined, return `isRunning: false`, `projectElapsed: 0`, `subPieceRemaining: 0`, and no-op `start`/`pause`/`reset` functions.
   - Avoid calling `useFocusStore` selectors inside `useTimer` when IDs are missing (or ensure they handle missing IDs).

3. Update existing tests:
   - `components/timer/__tests__/TimerPanel.test.tsx`: add a test that simulates the transition from empty state to active project without crashing.
   - `hooks/__tests__/useTimer.test.tsx`: add a test for `useTimer(undefined, undefined)` returning safe neutral values.

## Test Plan

- Run `npx vitest run components/timer/__tests__/TimerPanel.test.tsx` — must pass.
- Run `npx vitest run hooks/__tests__/useTimer.test.tsx` — must pass.
- Run `npx tsc --noEmit` — must pass.
- Run `npm test` — full suite must pass.

## Verification

After the fix, hard-reloading `/timer` and navigating between `/` → `/timer` should not produce a React hooks-order error overlay.

## Files to Modify

- `components/timer/TimerPanel.tsx`
- `hooks/useTimer.ts` (only if nullable-ID support is not already safe)
- `components/timer/__tests__/TimerPanel.test.tsx`
- `hooks/__tests__/useTimer.test.tsx`

## Agent Instructions

- Read `components/timer/TimerPanel.tsx` and `hooks/useTimer.ts` first.
- Make the minimal change needed to keep hook count stable across renders.
- Do not refactor unrelated timer logic.
- Write/update tests as specified above.
- Run the test commands and ensure they pass before reporting completion.
- Report the exact changes made and test results.
