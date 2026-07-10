# Master Skill: Projects, Sub-pieces & Timer

## Purpose
Build and maintain the project/sub-piece data model, CRUD UI, timer engine, timer panel, and all focus-session completion/refocus flows.

## Scope
- Project CRUD: list, card, form, delete, target edit
- Sub-piece CRUD: form, list, card, detail dialog, refocus
- Timer engine: `useTimer` hook with drift correction and session restore
- Timer UI: `TimerDisplay`, `TimerControls`, `TimerPanel`, `CompletionDialog`
- Focus flow: active project/sub-piece selection, project-only focus, completion/refocus resets

## Key Files
- `lib/store/slices/projectSlice.ts`
- `lib/types/index.ts`
- `lib/constants.ts`
- `hooks/useTimer.ts`
- `components/timer/TimerPanel.tsx`
- `components/timer/TimerDisplay.tsx`
- `components/timer/TimerControls.tsx`
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
- Sends `START_TIMER`/`PAUSE_TIMER`/`RESET_TIMER` commands to the extension via `ff:command` CustomEvents.

### TimerPanel
- Resolves active sub-piece with priority: explicit `activeSubPieceId` → first incomplete sub-piece → project-only focus.
- Wires `useTimer`, `TimerDisplay`, `TimerControls`, `CompletionDialog`, `SubPieceForm`.
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

## Completed Pieces
- Sub-piece Budget UI Validation
- Notification Fix Plan Piece 1 — Remove TimerToast

## Current Piece: Notification Fix Plan — Piece 3: Pause extension on web-app completion

### Goal
When the web-app timer auto-completes (sub-piece reaches zero or project target is crossed), explicitly send `PAUSE_TIMER` to the extension before clearing `ff_active_session`, so the extension engine stops cleanly and does not continue with stale state.

### Background
- `hooks/useTimer.ts` has two auto-complete branches in the RAF `tick` loop:
  1. Sub-piece reaches zero.
  2. Project target is crossed.
- Both branches currently set `isRunning = false`, update the store, remove `ff_active_session`, and call `onComplete()`.
- They do not notify the extension, so the extension service worker may still consider the session running until its next alarm tick discovers the completion.

### Files to read
- `hooks/useTimer.ts`
- `hooks/__tests__/useTimer.test.tsx`

### Files to modify
- Modify: `hooks/useTimer.ts`
- Modify: `hooks/__tests__/useTimer.test.tsx`

### Implementation details

1. **Send `PAUSE_TIMER` in the sub-piece completion branch**
   - In the RAF `tick` loop, inside the `if (subPieceId && prevSubPieceRemaining > 0 && nextSubPieceRemaining === 0)` block.
   - After updating local state and store, **before** `localStorage.removeItem(SESSION_KEY)` and `onCompleteRef.current?.()`, add:
     ```ts
     void sendTimerCommand("PAUSE_TIMER");
     ```

2. **Send `PAUSE_TIMER` in the project target completion branch**
   - In the RAF `tick` loop, inside the target-crossed block.
   - After updating local state and store, **before** `localStorage.removeItem(SESSION_KEY)` and `onCompleteRef.current?.()`, add:
     ```ts
     void sendTimerCommand("PAUSE_TIMER");
     ```

3. **Keep existing behavior unchanged**
   - Still cancel the RAF loop.
   - Still call `state.completeSubPiece` / `state.completeProject`.
   - Still remove `ff_active_session`.
   - Still call `onCompleteRef.current?.()`.

### Test strategy

1. **Sub-piece completion sends PAUSE_TIMER**
   - Render `useTimer` with a sub-piece, start it, advance time until `subPieceRemaining` hits 0.
   - Assert that `window.dispatchEvent` was called with a `CustomEvent` whose `detail.action === "PAUSE_TIMER"`.
   - The existing `ff:command` spy approach in `useTimer.test.tsx` can be reused.

2. **Project target completion sends PAUSE_TIMER**
   - Render `useTimer` project-only mode (no `subPieceId`) with a target, start it, advance time past the target.
   - Assert `PAUSE_TIMER` command is dispatched.

3. **Existing tests still pass**
   - `useTimer.test.tsx` should remain green after adding the new assertions.

### Verification commands
```bash
npx tsc --noEmit
npx vitest run hooks/__tests__/useTimer.test.tsx
```

### Agent constraints
- Read no more than 3 files.
- Modify only `hooks/useTimer.ts` and `hooks/__tests__/useTimer.test.tsx`.
- Do not change unrelated timer behavior.
- Do not open a browser or run `npm run dev`.
- Report completion only after all verification commands pass.

## Agent Notes
- `sendTimerCommand` is defined inside `useTimer.ts` and dispatches `ff:command` CustomEvents.
- The extension content script (`control.content.ts`) forwards these events to the extension background.
- Use `void sendTimerCommand("PAUSE_TIMER")` so the async dispatch does not block the completion flow.
- Ensure the command is sent before `localStorage.removeItem(SESSION_KEY)` so the extension receives the pause while the completed state is still locally available.

## Next Piece (pending)
- Piece 4 — End-to-end invariant test: add one test to `extension/lib/__tests__/timerEngine.test.ts` simulating a 5-minute sub-piece with 30s alarm ticks and asserting the exact Start → Milestone → Milestone → Milestone → AlmostDone → Complete sequence.
