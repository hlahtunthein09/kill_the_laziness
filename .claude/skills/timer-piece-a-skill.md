# Skill: Timer Piece A — `useTimer` baseline fix

## Goal
Change `useTimer` so the project-level timer counts **up from 0 per session toward `project.targetTimeSeconds`**, instead of initializing from `project.totalTimeSeconds`.

`project.totalTimeSeconds` must keep incrementing every second as before (store XP/fortress/daily goal depend on it). Only the displayed/per-session `projectElapsed` value changes.

## Files to modify
- `hooks/useTimer.ts`
- `hooks/__tests__/useTimer.test.tsx`

## Implementation details
1. In `computeInit`, when there is no saved session, set `projectElapsed: 0` (not `initialProjectTime`).
2. Remove `initialProjectTimeRef` and its `useEffect`; it is no longer needed.
3. In the RAF `tick` loop, use `nextProjectElapsed` directly as session-elapsed seconds for the 5-second persistence trigger:
   - Persist when `nextProjectElapsed - lastPersistRef.current >= 5`.
4. Keep `incrementProjectTime(projectId, secondsElapsed)` calls unchanged so store totals still grow.
5. In `resetToZero`, set `projectElapsed` display to `0` (do not read `updatedProject.totalTimeSeconds`). Update session baselines to `0`.
6. In `reset` and `reinitialize`, restore display to the session baseline (`0` for a fresh session). The existing delta-subtraction from store in `reset` stays correct because baseline is now `0`.
7. Keep the sub-piece countdown logic exactly as-is.
8. Do **not** reintroduce any UI reset button; this is hook-only work.

## Tests
- Update existing tests so they pass with the new semantics.
- Add tests that seed `project.totalTimeSeconds > 0` and assert `projectElapsed` still starts at `0`.
- Add tests verifying:
  - timer increments from `0` when running,
  - reset returns display to `0` and reverts store,
  - reinitialize returns display to `0` without changing store,
  - restored session starts from saved `projectElapsed` value.

## Verification
- `npx tsc --noEmit`
- `npx vitest run hooks/__tests__/useTimer.test.tsx`
- Both must pass before reporting completion.

## Memory
Append a one-line status to `.claude/memory/progress.md` when done.
