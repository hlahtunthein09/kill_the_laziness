# Skill: Fix Timer Target Completion — Store + useTimer (Piece A)

## Goal
Stop the timer and mark the project completed when `projectElapsed` reaches `project.targetTimeSeconds`. Fix both project-only focus and sub-piece focus so the timer never runs past the target.

## Scope
- Modify `lib/store/slices/projectSlice.ts` — add `completeProject` action and cap `incrementProjectTime` at target.
- Modify `hooks/useTimer.ts` — read project target, stop at target, call `completeProject`, fire `onComplete`.
- Update tests: `lib/store/__tests__/useFocusStore.test.ts`, `hooks/__tests__/useTimer.test.tsx`.
- Do NOT touch `TimerPanel` UI (Piece B).

## Store changes (`lib/store/slices/projectSlice.ts`)
1. Add `completeProject: (projectId: string) => void` to `ProjectSlice` interface.
2. Implement `completeProject`:
   ```ts
   completeProject: (projectId) => {
     set((state) => ({
       projects: state.projects.map((p) =>
         p.id === projectId ? { ...p, status: "completed" as PieceStatus } : p
       ),
     }));
   },
   ```
3. Cap `incrementProjectTime` so `totalTimeSeconds` never exceeds `targetTimeSeconds`:
   - Before adding seconds, compute `remainingTargetSeconds = Math.max(0, p.targetTimeSeconds - p.totalTimeSeconds)`.
   - Use `actualSeconds = Math.min(seconds, remainingTargetSeconds)`.
   - Add `actualSeconds` instead of `seconds`.
   - If `actualSeconds > 0 && remainingTargetSeconds === actualSeconds` (i.e. target reached), also set `status: "completed"`.
   - Compute XP from `actualSeconds`.

## useTimer changes (`hooks/useTimer.ts`)
1. Read project target in the hook (next to where `project` is selected):
   ```ts
   const targetTimeSeconds = project?.targetTimeSeconds ?? 0;
   ```
2. In the RAF `tick` function, when processing whole seconds:
   - Compute `remainingToTarget = targetTimeSeconds > 0 ? Math.max(0, targetTimeSeconds - projectElapsedRef.current) : Infinity`.
   - `const appliedSeconds = Math.min(secondsElapsed, remainingToTarget);`
   - Only apply `appliedSeconds` to `projectElapsedRef.current`, `subPieceRemainingRef.current`, store increments, and persist.
   - If `appliedSeconds < secondsElapsed` OR `projectElapsedRef.current >= targetTimeSeconds` (target reached), stop the timer:
     - `setIsRunningRef.current(false);`
     - cancel RAF
     - call `useFocusStore.getState().completeProject(projectId)` (or update project status if Piece A store change not yet available; agent must coordinate)
     - clear `localStorage` session
     - call `onCompleteRef.current?.()`
     - return
   - Keep existing sub-piece auto-complete check, but if target is reached in same tick, target completion takes precedence (stop and call onComplete).
3. In `start()`, also prevent starting if target already reached:
   ```ts
   if (targetTimeSeconds > 0 && projectElapsedRef.current >= targetTimeSeconds) return;
   ```
   (Place after the sub-piece check.)
4. In `computeInit`, cap restored `projectElapsed` at `targetTimeSeconds` if target > 0 and mark not running if already at/over target.

## Tests
### `lib/store/__tests__/useFocusStore.test.ts`
- `incrementProjectTime` caps at target: project with `targetTimeSeconds=600`, `totalTimeSeconds=580`, increment 60s → `totalTimeSeconds=600`, status `completed`.
- `completeProject` sets status to `completed`.

### `hooks/__tests__/useTimer.test.tsx`
- Timer stops and calls `onComplete` when project target is reached (project-only focus, no subPieceId).
- Timer stops at target even if sub-piece still has remaining time.
- `start()` is no-op when project already at target.

## Verify (piece NOT done until all pass)
- `npx tsc --noEmit`
- `npx vitest run lib/store/__tests__/useFocusStore.test.ts hooks/__tests__/useTimer.test.tsx`

## Done criteria
Timer stops at project target, store caps total time and marks completed, tests pass, tsc clean.
