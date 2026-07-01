# Skill: Timer Piece C — `TimerPanel` wiring

## Goal
Wire the new `targetTimeSeconds` prop from the active project into `TimerDisplay` via `TimerPanel`.

## Files to modify
- `components/timer/TimerPanel.tsx`
- `components/timer/__tests__/TimerPanel.test.tsx` (and any related TimerPanel test files)

## Implementation details
1. In `TimerPanel`, read `activeProject.targetTimeSeconds`.
2. Pass `targetTimeSeconds={activeProject.targetTimeSeconds}` to `<TimerDisplay />`.
3. Do not change `TimerControls`, `TimerToast`, `ScheduleToast`, or `SessionSummary` wiring.
4. Keep existing sub-piece resolution and `projectOnlyFocus` behavior unchanged.

## Tests
- Add/update a test that verifies the target label/progress bar from `TimerDisplay` renders when an active project with `targetTimeSeconds > 0` is present.
- Ensure existing `TimerPanel` tests still pass.

## Verification
- `npx tsc --noEmit`
- `npx vitest run components/timer/__tests__/TimerPanel.test.tsx`
- Both must pass before reporting completion.

## Memory
Append a one-line status to `.claude/memory/progress.md` when done.
