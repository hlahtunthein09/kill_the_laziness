# Skill: TimerControls Toggle Start/Pause Based on `isRunning` (Observation #3A)

## Scope
Change `TimerControls` so it only renders the relevant action button: Start when paused, Pause when running. Reset is always visible.

## Files
- `components/timer/TimerControls.tsx`
- `components/timer/__tests__/TimerControls.test.tsx`

## Changes
1. In `TimerControls.tsx`, conditionally render either the Start button or the Pause button based on `isRunning`.
2. Reset button remains always rendered.
3. Update tests to assert conditional rendering instead of disabled states.

## Test Strategy
- Run `npx vitest run components/timer/__tests__/TimerControls.test.tsx`
- Expect tests for:
  - Start button rendered when paused
  - Pause button rendered when running
  - Reset button always rendered
  - Click handlers still fire
- Run `npx tsc --noEmit`.

## Verification
- No browser verification required.
