# Skill: F2 — TimerPanel Uses `activeSubPieceId`

## Goal
Make `TimerPanel` respect the user's explicitly selected sub-piece instead of always auto-picking the first incomplete one.

## Scope
- Modify only `components/timer/TimerPanel.tsx`.
- Modify only `components/timer/__tests__/TimerPanel.test.tsx`.

## Required Changes
1. In `components/timer/TimerPanel.tsx`:
   - Read `activeSubPieceId` from `useFocusStore`.
   - Compute the active sub-piece in this priority order:
     1. If `activeSubPieceId` points to an incomplete sub-piece under the active project, use it.
     2. Otherwise fall back to the first incomplete sub-piece under the active project.
     3. Otherwise no sub-piece (project-only focus).
   - Pass the resolved sub-piece ID (or `undefined`) to `useTimer`.
   - Pass `allocatedMinutes` and `onResetToZero` only when a sub-piece is resolved.
   - Keep the project-only focus UI behavior that was implemented in E2.
2. In `components/timer/__tests__/TimerPanel.test.tsx`:
   - Update tests to provide `activeSubPieceId` in mocked store state where needed.
   - Add a test that verifies when `activeSubPieceId` is set, that sub-piece name is shown instead of the first incomplete one.
   - Add/update a test that verifies fall back to first incomplete when `activeSubPieceId` is invalid/completed.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerPanel.test.tsx` passes.
- [ ] No files outside the scope are modified.
