# Skill: Project-Only Focus Flag (Whole Project Timer)

## Goal
Distinguish "focus whole project" from "no sub-piece selected" so `TimerPanel` shows a project-only timer when the user explicitly focuses the whole project.

## Scope
- Modify `lib/store/slices/projectSlice.ts`.
- Modify `lib/store/useFocusStore.ts` (if needed for default state).
- Modify `components/timer/TimerPanel.tsx`.
- Update tests:
  - `lib/store/__tests__/useFocusStore.test.ts`
  - `components/timer/__tests__/TimerPanel.test.tsx`

## Required Changes
1. Add `projectOnlyFocus: boolean` to `ProjectSlice` state.
2. Initialize `projectOnlyFocus: false`.
3. Update `setActiveProject(id)`:
   - Set `activeProjectId: id`
   - Set `activeSubPieceId: null`
   - Set `projectOnlyFocus: true`
   - Recompute project statuses as before.
4. Update `setActiveSubPiece(projectId, subPieceId)`:
   - Set `activeSubPieceId: subPieceId`
   - Set `projectOnlyFocus: false`
5. Update `TimerPanel` logic:
   - If `projectOnlyFocus` is true → render project-only timer (no sub-piece remaining, no sub-piece name).
   - If `projectOnlyFocus` is false → existing behavior: use `activeSubPieceId` or fall back to first incomplete sub-piece.

## Test Strategy
- Store test: `setActiveProject` sets `projectOnlyFocus: true` and clears `activeSubPieceId`.
- Store test: `setActiveSubPiece` sets `projectOnlyFocus: false`.
- TimerPanel test: when `projectOnlyFocus` is true, sub-piece name and remaining time are not shown even if sub-pieces exist.
- Run `npx tsc --noEmit`.
- Run targeted tests.

## Verification
- TypeScript clean.
- Targeted tests pass.
