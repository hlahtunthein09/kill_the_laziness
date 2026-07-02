# Skill: Restore Project-Level Timer Continuity

## Goal
Fix regression: switching to another project and back shows project time as **0**. Restore per-project continuity by seeding the project timer from the persisted store value, while KEEPING the count-up display direction.

## Root cause
`hooks/useTimer.ts` → `computeInit` returns `projectElapsed: 0` for the no-session branch, ignoring the persisted `project.totalTimeSeconds`. Since only ONE `ff_active_session` slot exists, switching projects overwrites it; returning to the first project finds no matching session → shows 0.

## Scope
- Modify ONLY `hooks/useTimer.ts` and `hooks/__tests__/useTimer.test.tsx`.
- Do NOT change `TimerDisplay.tsx`, `TimerPanel.tsx`, or the store.
- Do NOT change counting direction (project counts UP; sub-piece display counts up via TimerDisplay). Only the initialization baseline changes.

## Implementation (`hooks/useTimer.ts`)
In `computeInit`, the **no-session** branch currently returns:
```
return {
  isRunning: false,
  projectElapsed: 0,          // <-- BUG: discards persisted total
  subPieceRemaining: initialSubPieceRemaining,
  shouldAutoComplete: false,
  autoCompleteSeconds: 0,
};
```
Change `projectElapsed: 0` → `projectElapsed: initialProjectTime` (which is `project.totalTimeSeconds ?? 0`, already passed in).

Verify the **with-session** branch still works: `projectElapsed = session.projectElapsed + (running ? effectiveDrift : 0)`. Because ticks add deltas on top of the seed and the store increments in parallel, `projectElapsed` now tracks the cumulative total consistently. No other change needed.

Do NOT auto-start; `isRunning` stays `false` on restore (reset/discard button handles zeroing).

## Tests (`hooks/__tests__/useTimer.test.tsx`)
- Update any test asserting `projectElapsed` starts at `0` when the project has a non-zero `totalTimeSeconds` and no active session — it should now equal `totalTimeSeconds`.
- Add a continuity test: project with `totalTimeSeconds: 120`, no session → `projectElapsed === 120` on mount, `isRunning === false`.
- Keep existing session-restore, drift, reset, resetToZero, and sub-piece tests passing (a fresh project with `totalTimeSeconds: 0` still yields `projectElapsed: 0`).

## Verify
- `npx tsc --noEmit`
- `npx vitest run hooks/__tests__/useTimer.test.tsx`

## Done criteria
Both pass; a project with saved total time shows that total (not 0) on mount and continues counting up; switching projects and back preserves each project's time.
