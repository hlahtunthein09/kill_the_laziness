# Master Skill: Projects, Sub-pieces & Timer

## Purpose
Build and maintain the project/sub-piece data model, CRUD UI, timer engine, timer panel, and all focus-session completion/refocus flows.

## Scope
- Project CRUD: list, card, form, delete, target edit
- Sub-piece CRUD: form, list, card, detail dialog, refocus
- Timer engine: `useTimer` hook with drift correction and session restore
- Timer UI: `TimerDisplay`, `TimerControls`, `TimerPanel`, `TimerToast`, `CompletionDialog`
- Focus flow: active project/sub-piece selection, project-only focus, completion/refocus resets

## Key Files
- `lib/store/slices/projectSlice.ts`
- `lib/types/index.ts`
- `lib/constants.ts`
- `hooks/useTimer.ts`
- `components/timer/TimerPanel.tsx`
- `components/timer/TimerDisplay.tsx`
- `components/timer/TimerControls.tsx`
- `components/timer/TimerToast.tsx`
- `components/timer/CompletionDialog.tsx`
- `components/projects/ProjectCard.tsx`
- `components/projects/ProjectForm.tsx`
- `components/projects/ProjectList.tsx`
- `components/projects/SubPieceCard.tsx`
- `components/projects/SubPieceForm.tsx`
- `components/projects/SubPieceList.tsx`
- `app/projects/page.tsx`
- `app/timer/page.tsx`

## Architecture Conventions

### Data Model
- `Project`: macro goal with `totalTimeSeconds`, `targetTimeSeconds`, `xp`, `fortressLevel`, `fortressHealth`, `status`.
- `SubPiece`: allocated countdown task under a project with `allocatedMinutes`, `elapsedSeconds`, `status`.
- Project timer counts **up** from tracked total.
- Sub-piece timer counts **down** from allocated minutes.
- All durations stored in **seconds** internally; format only at display time.

### Store Patterns
- Use `useFocusStore.getState()` for actions inside callbacks/event handlers.
- Key actions: `addProject`, `updateProject`, `deleteProject`, `setActiveProject`, `setActiveSubPiece`, `addSubPiece`, `updateSubPiece`, `deleteSubPiece`, `completeSubPiece`, `refocusSubPiece`, `restartProject`, `incrementProjectTime`, `incrementSubPieceTime`.
- Sub-piece budget: sum of allocated minutes cannot exceed project target; use `getRemainingBudgetSeconds`.

### Timer Engine (`hooks/useTimer.ts`)
- Uses `requestAnimationFrame` + `Date.now()` delta for accuracy.
- Persists active session to `localStorage` key `ff_active_session` every 5 seconds.
- On mount, restores session and applies drift capped at `MAX_DRIFT_SECONDS`.
- Auto-pauses and marks complete when sub-piece reaches zero.
- Auto-pauses and marks project complete when target reached.
- Exposes: `isRunning`, `projectElapsed`, `subPieceRemaining`, `targetReached`, `start`, `pause`, `reset`, `resetToZero`, `reinitialize`, `restart`.

### TimerPanel
- Resolves active sub-piece with priority: explicit `activeSubPieceId` → first incomplete sub-piece → project-only focus.
- Wires `useTimer`, `TimerDisplay`, `TimerControls`, `TimerToast`, `CompletionDialog`, `SubPieceForm`.
- Shows project-mode summary when target reached without sub-piece completion.
- Shows sub-piece-mode summary when a sub-piece completes.
- Handles extension command events (`ff:start`, `ff:pause`, `ff:reset`, `ff:state`) when extension is present.

### Completion / Refocus Flow
- Sub-piece complete → `CompletionDialog` with "Continue focusing" and "Add new sub-piece".
  - Continue: call `refocusSubPiece` + `setActiveSubPiece`, then restart timer.
  - Add new: open `SubPieceForm`; on add, set new sub-piece active.
- Project target reached → `CompletionDialog` in project mode with "Continue focusing" and "Back to projects".

## Implementation Checklist

1. Read `.claude/memory/timer-behavior.md`, `.claude/memory/store-schema.md`, and `.claude/memory/ui-conventions.md`.
2. Keep all time values in seconds in code; format with `formatDuration()` for display.
3. Use `cn()` for conditional Tailwind classes.
4. Burmese-first labels; English secondary.
5. Hydration-safe: lazy state initialization, `suppressHydrationWarning` where needed.
6. Every new timer/project/sub-piece behavior needs tests.

## Testing Strategy
- Store tests: Vitest, mock store state, assert actions and selectors.
- Hook tests: `renderHook`, mock `requestAnimationFrame` and `Date.now`.
- Component tests: RTL, mock `useTimer` and `useFocusStore` where needed.
- Test edge cases: empty states, target reached, sub-piece completion, drift cap, reset semantics, budget overflow.
- Run targeted tests: `npx vitest run components/timer/__tests__ hooks/__tests__ lib/store/__tests__`.
- Always run `npx tsc --noEmit`.

## Agent Notes
- When modifying `useTimer`, preserve hook count stability; no conditional hooks.
- When modifying the store, keep `totalTimeSeconds`, `xp`, `fortressLevel`, and `fortressHealth` in sync.
- When adding a new completion/refocus path, reuse existing store actions (`refocusSubPiece`, `restartProject`) rather than inventing new ones.
- Be careful with `useTimer` baselines (`sessionStartProjectElapsedRef`, `sessionStartSubPieceRemainingRef`); resets/reinitializes must restore the correct baseline.
- The extension may also drive the timer; do not break the `ff:command` / `ff:state` bridge.
