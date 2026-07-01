# Skill: Timer Piece B — `TimerDisplay` target UI

## Goal
Add a target-time indicator to `TimerDisplay` so users see their progress toward the project's `targetTimeSeconds` while the timer counts up.

## Files to modify
- `components/timer/TimerDisplay.tsx`
- `components/timer/__tests__/TimerDisplay.test.tsx`

## Implementation details
1. Add optional prop `targetTimeSeconds?: number` to `TimerDisplayProps`.
2. When `targetTimeSeconds` is provided and > 0:
   - Show the target duration under the project time, e.g. `target: 8h`.
   - Render a thin progress bar (`w-full h-2 rounded-full bg-muted overflow-hidden`) with a fill (`h-full bg-primary transition-all`) whose width is `min(100%, (projectElapsed / targetTimeSeconds) * 100)%`.
   - Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for accessibility.
3. Keep the existing project time value, status badge, and sub-piece remaining UI unchanged.
4. Use theme tokens (`bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`, `bg-muted`) so it works in light and dark modes.

## Tests
- Render with `targetTimeSeconds` > 0:
  - target label is shown,
  - progress bar is rendered,
  - fill width matches the elapsed/target ratio.
- Render with `targetTimeSeconds` undefined / 0:
  - no target UI is rendered.
- Progress clamps at 100% when `projectElapsed >= targetTimeSeconds`.

## Verification
- `npx tsc --noEmit`
- `npx vitest run components/timer/__tests__/TimerDisplay.test.tsx`
- Both must pass before reporting completion.

## Memory
Append a one-line status to `.claude/memory/progress.md` when done.
