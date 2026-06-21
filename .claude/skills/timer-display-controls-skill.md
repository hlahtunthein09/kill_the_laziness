# Skill: Timer Display + Controls Build

## Purpose
Create the presentational timer UI: display elapsed/remaining times and Start/Pause/Reset controls.

## Scope
- **Create**
  - `components/timer/TimerDisplay.tsx`
  - `components/timer/TimerControls.tsx`
  - `components/timer/__tests__/TimerControls.test.tsx`
- **Modify**: none
- **Size**: Small — 3 files, ~120 lines

## References
- `.claude/memory/ui-conventions.md`
- `lib/time.ts` — `formatDuration`
- `components/ui/button.tsx`
- `components/projects/ProjectCard.tsx` — status badge pattern

## Steps
1. Read memory files and reference components.
2. Create `components/timer/TimerDisplay.tsx`.
   - Props:
     ```ts
     interface TimerDisplayProps {
       projectElapsed: number; // seconds
       subPieceRemaining: number; // seconds
       isRunning: boolean;
     }
     ```
   - Show project elapsed and sub-piece remaining in `HH:MM:SS` via `formatDuration`.
   - Burmese labels with English secondary.
   - Status badge: running/paused.
3. Create `components/timer/TimerControls.tsx`.
   - Props:
     ```ts
     interface TimerControlsProps {
       isRunning: boolean;
       onStart: () => void;
       onPause: () => void;
       onReset: () => void;
     }
     ```
   - Render Start / Pause / Reset buttons.
   - Burmese labels with English secondary.
   - Disable Start when running; disable Pause when not running.
4. Create `components/timer/__tests__/TimerControls.test.tsx`.
   - Test that Start, Pause, Reset buttons render.
   - Test that clicking each calls the correct callback.
5. Run `npx tsc --noEmit` and `npx vitest run components/timer/__tests__/TimerControls.test.tsx`.
6. Update `.claude/memory/progress.md`.

## Rules
- Pure presentational components only. No `useTimer`, no store access.
- Use `formatDuration` for time formatting.
- Burmese-first labels.
- Use shadcn/ui `Button` and pastel theme colors.

## Agent
- **UI Designer**

## Verification
- TypeScript compiles.
- Tests pass.
- Buttons render correctly and call callbacks.
- Time display formats durations properly.
