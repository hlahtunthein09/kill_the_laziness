# Skill: TimerPanel Project Target Completion Summary (Piece B)

## Goal
Show a `SessionSummary` when the project reaches its target time, not just when a sub-piece hits zero.

## Scope
- Modify ONLY `components/timer/TimerPanel.tsx` and `components/timer/__tests__/TimerPanel.test.tsx` (and any existing TimerPanel split test files if needed).
- Do NOT touch `useTimer`, `projectSlice`, or `SessionSummary` itself.

## Background
- `useTimer` now fires `onComplete` when either:
  - a sub-piece reaches zero, OR
  - the project's `targetTimeSeconds` is reached.
- `TimerPanel` currently only shows `SessionSummary` when `showSummary` is true AND a `completedSubPiece` exists.
- For project-only focus or when the target is reached before the sub-piece zeroes, there may be no completed sub-piece, so the summary never renders.

## Implementation (`components/timer/TimerPanel.tsx`)
1. Track whether the completion was project-target-based (not sub-piece-based) with a new state flag:
   ```tsx
   const [projectCompleted, setProjectCompleted] = useState(false);
   ```
2. Update `handleComplete` callback:
   ```tsx
   const handleComplete = useCallback(() => {
     setToastTrigger("complete");
     setShowSummary(true);
     setProjectCompleted(true);
     playCompleteSound();
   }, []);
   ```
3. In the summary rendering block, handle two cases:
   - **Sub-piece completed** (existing): use `completedSubPiece` data.
   - **Project target completed** (new): use project-level data.
4. Compute project-summary values:
   ```tsx
   const projectElapsedSeconds = Math.min(projectElapsed, activeProject.targetTimeSeconds);
   const projectXpGained = Math.floor(projectElapsedSeconds / 60) * XP_PER_MINUTE;
   ```
   (If a sub-piece also completed in the same tick, prefer the sub-piece summary; otherwise show project summary.)
5. Render `SessionSummary` for project completion with:
   - `projectName={activeProject.name}`
   - `subPieceName={"ပရောဂျက်ပစ်မှတ် (Project Target)"}` — or an English-only/bilingual label.
   - `elapsedSeconds={projectElapsedSeconds}`
   - `allocatedMinutes={Math.round(activeProject.targetTimeSeconds / 60)}`
   - `xpGained={projectXpGained}`
6. Reset `projectCompleted` in `handleContinue`:
   ```tsx
   const handleContinue = () => {
     reinitialize();
     setShowSummary(false);
     setProjectCompleted(false);
   };
   ```

## Label choice
Use Burmese-first label for the "project target" sub-piece name:
```
ပရောဂျက်ပစ်မှတ် (Project Target)
```
This is consistent with other Burmese-first labels in the app.

## Tests (`components/timer/__tests__/TimerPanel.test.tsx`)
Add a test that simulates project target completion:
- Mock `useTimer` to return `isRunning: false`, `projectElapsed` equal to target, `subPieceRemaining: 0`, and trigger `handleComplete`.
- Assert `SessionSummary` renders with project name and the project target label.
- Assert the Continue button is present.

Keep all existing TimerPanel tests passing.

## Verify (piece NOT done until all pass)
- `npx tsc --noEmit`
- `npx vitest run components/timer/__tests__/TimerPanel.test.tsx components/timer/__tests__/TimerPanel.session-summary.test.tsx components/timer/__tests__/TimerPanel.extension-controls.test.tsx`

## Done criteria
Project target completion shows `SessionSummary` with project name, elapsed target time, and XP; existing sub-piece summary still works; all TimerPanel tests pass.
