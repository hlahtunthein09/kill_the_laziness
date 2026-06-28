# Skill: E2b — TimerPanel Project-Only Focus

## Goal
Allow a user to focus on a project that has no sub-pieces. `TimerPanel` should render the timer UI for project-only time tracking instead of showing the empty state.

## Scope
- Modify `components/timer/TimerPanel.tsx`.
- Modify `components/timer/__tests__/TimerPanel.test.tsx`.

## Required Changes
1. In `components/timer/TimerPanel.tsx`:
   - Keep the empty state for when there is no active project.
   - Remove or change the empty state for when there is an active project but no incomplete sub-piece.
   - When an active project exists, always render the main timer UI.
   - Pass `firstIncompleteSubPiece?.id` to `useTimer` (it may be `undefined`).
   - Pass `onResetToZero` to `TimerControls` only when a sub-piece exists.
   - In the timer UI:
     - Show the project name.
     - Show the sub-piece name only when a sub-piece exists; otherwise show a placeholder such as `ပရောဂျက် focus (Project Focus)` or omit it.
     - Pass `allocatedMinutes` to `TimerDisplay` only when a sub-piece exists.
2. In `components/timer/__tests__/TimerPanel.test.tsx`:
   - Update the test "shows empty state when active project has no incomplete sub-pieces" to expect the timer UI instead.
   - Ensure the project name is visible.
   - Ensure timer controls are visible.
   - Ensure the red Reset button is not rendered when there is no sub-piece.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerPanel.test.tsx` passes.
- [ ] No files outside the scope are modified.
