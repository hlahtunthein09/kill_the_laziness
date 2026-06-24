# Skill: Tier 3 Piece 2b — Wire SessionSummary into TimerPanel

## Goal
Show `SessionSummary` in `TimerPanel` when the active sub-piece completes.

## Files to Read
1. `components/timer/SessionSummary.tsx`
2. `components/timer/TimerPanel.tsx`
3. `lib/constants.ts`
4. `hooks/useTimer.ts`

## Files to Create
1. `components/timer/__tests__/TimerPanel.session-summary.test.tsx`

## Files to Modify
1. `components/timer/TimerPanel.tsx`

## Implementation Details
- Detect completion in `TimerPanel` using existing `prevSubPieceRemainingRef` logic.
- When `prevSubPieceRemaining > 0` and `subPieceRemaining === 0`, the sub-piece just finished.
- Read the completed sub-piece from the store (it now has `status === "completed"`).
- Compute XP gained:
  - `xpPerMinute = Math.floor(elapsedSeconds / 60) * XP_PER_MINUTE`
  - `totalXp = xpPerMinute + XP_SUB_PIECE_COMPLETE`
- Render `SessionSummary` with:
  - `projectName={activeProject.name}`
  - `subPieceName={completedSubPiece.name}`
  - `elapsedSeconds={completedSubPiece.elapsedSeconds}`
  - `allocatedMinutes={completedSubPiece.allocatedMinutes}`
  - `xpGained={totalXp}`
- When summary is shown, hide or dim `TimerDisplay` / `TimerControls` (replace with summary centered).
- Add a dismiss/continue button that resets the timer view (calls `reset()`).

## Test Strategy
Create `components/timer/__tests__/TimerPanel.session-summary.test.tsx`:
- Mock `useTimer` to return a completed state (`subPieceRemaining: 0`, `projectElapsed: 600`).
- Mock `useFocusStore` to return a project with one completed sub-piece.
- Test: `SessionSummary` renders with project/sub-piece names.
- Test: XP shown includes completion bonus.
- Test: dismiss button calls `reset()`.

Update existing `TimerPanel.test.tsx` if mock shape changes.

Run:
1. `npx vitest run components/timer/__tests__/TimerPanel.session-summary.test.tsx components/timer/__tests__/TimerPanel.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `TimerPanel` detects completion and renders `SessionSummary`
- [ ] XP calculation uses `XP_PER_MINUTE` + `XP_SUB_PIECE_COMPLETE`
- [ ] New test file created and passing
- [ ] Existing `TimerPanel` tests still passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- No changes to `useTimer` or store.
- Keep under 40 lines of modification in `TimerPanel.tsx`.
