# Skill: Remove Timer Ring from TimerDisplay

## Goal
Remove the circular timer ring from `TimerDisplay` because it is decorative and makes the UI look cluttered.

## Scope
- Modify only `components/timer/TimerDisplay.tsx`.
- Modify only `components/timer/__tests__/TimerDisplay.test.tsx`.

## Required Changes
1. In `components/timer/TimerDisplay.tsx`:
   - Remove the `TimerRing` import and usage.
   - Remove the `showRing` logic.
   - Keep the project time and remaining time display.
   - Clean up the layout so numbers remain centered without the ring.
2. In `components/timer/__tests__/TimerDisplay.test.tsx`:
   - Remove or update tests that assert the ring is rendered.
   - Keep tests for project time, remaining time, and status badge.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerDisplay.test.tsx` passes.
- [ ] No files outside the scope are modified.
