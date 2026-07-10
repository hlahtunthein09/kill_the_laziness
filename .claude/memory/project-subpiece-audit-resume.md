---
name: project-subpiece-audit-resume
description: Resume point for project/sub-piece logic fixes. Option A complete; user-chosen extend + padding fix applied.
metadata:
  type: project
---

# Project/Sub-piece Logic Fixes — Resume Point

**Date:** 2026-07-06
**Status:** Option A complete and UX fix applied. User now chooses the extend amount; warning dialog padding increased. Full suite has 4 unrelated pre-existing failures.

## Recently completed

- Notification sequence work (Pieces 1–3): `notifyAlmostDone`, timer engine orchestration, milestone suppression, auto-dismiss via `requireInteraction: false` + visual suffixes.
- Store-level refocus budget fix:
  - `getRemainingBudgetSeconds` now uses `Math.max(totalTimeSeconds, allocatedSeconds)`.
  - `refocusSubPiece` clamps new `allocatedMinutes` to remaining budget.
- `lib/store/__tests__/useFocusStore.test.ts` — 81/81 passing.
- UI budget validation Option A:
  - **A1:** Created `lib/project.ts` with `getRemainingTargetSeconds` and `doesSubPieceFit`; `lib/__tests__/project.test.ts` — 16 tests passing.
  - **A2:** `components/projects/SubPieceCard.tsx` blocks focus/refocus when sub-piece exceeds remaining target; warning dialog + refocus inline validation; `SubPieceCard.test.tsx` — 27 tests passing.
  - **A3:** `components/timer/TimerPanel.tsx` blocks Start when active sub-piece exceeds remaining target; warning dialog with Extend/Focus-whole/Cancel; `TimerPanel.test.tsx` — 27 tests passing.
- **UX fix:** Replaced auto-extend-by-deficit with user-input extend dialog in `SubPieceCard.tsx` (warning + refocus paths) and `TimerPanel.tsx` (Start warning); improved warning dialog padding (`p-6`, `mb-2`, `gap-3 mt-4`).

## What is still pending

None under this resume point. The user's original complaint is fixed.

## Correct fix implemented (Option A)

1. ✅ **SubPieceCard Focus button** — blocks focus and shows warning dialog when sub-piece does not fit.
2. ✅ **SubPieceCard refocus dialog** — shows inline validation error instead of silent clamp.
3. ✅ **TimerPanel Start button** — blocks start and shows warning dialog when active sub-piece does not fit.
4. ✅ **ProjectCard focus whole project** — no change; project-only mode remains open-ended.
5. ✅ **User-chosen extend amount** — "Extend target" opens an input dialog for the user to choose minutes.
6. ✅ **Warning dialog padding** — increased slightly for clearer UI.

## Helper

`lib/project.ts`:

```ts
export function getRemainingTargetSeconds(project: Project): number {
  return Math.max(0, project.targetTimeSeconds - project.totalTimeSeconds);
}

export function doesSubPieceFit(project: Project, subPiece: SubPiece): boolean {
  const remaining = getRemainingTargetSeconds(project);
  return subPiece.allocatedMinutes * 60 <= remaining;
}
```

## Files involved

- `lib/project.ts` ✅
- `lib/__tests__/project.test.ts` ✅
- `components/projects/SubPieceCard.tsx` ✅
- `components/projects/__tests__/SubPieceCard.test.tsx` ✅
- `components/timer/TimerPanel.tsx` ✅
- `components/timer/__tests__/TimerPanel.test.tsx` ✅

## Next action

User review. Decide whether to commit these changes or address the 4 unrelated pre-existing test failures first.

## Uncommitted changes

Working tree on `main` has uncommitted changes from:
- Notification sequence pieces (Pieces 1–3)
- Diagnostic logging added to notification clear path
- `requireInteraction: false` + visual suffixes for start/milestone notifications
- Store-level refocus budget clamp
- A1 target budget helpers
- A2 SubPieceCard validation
- A3 TimerPanel Start validation
- User-chosen extend amount + padding fix

## Verification

- Targeted tests pass:
  - `npx vitest run lib/__tests__/project.test.ts` — 16/16
  - `npx vitest run components/projects/__tests__/SubPieceCard.test.tsx` — 27/27
  - `npx vitest run components/timer/__tests__/TimerPanel.test.tsx` — 27/27
- `npx tsc --noEmit` clean.
- Full suite `npm test` — 4 unrelated pre-existing failures:
  - `app/__tests__/globals.test.ts` (2 dark mode CSS failures)
  - `components/projects/__tests__/ProjectCard.target-edit.test.tsx` (1 mock-related failure)
  - `components/projects/__tests__/ProjectCard.delete.test.tsx` (1 mock-related failure)
