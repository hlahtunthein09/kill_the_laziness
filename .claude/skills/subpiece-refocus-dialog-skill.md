# Skill: G2b — SubPieceCard Refocus Dialog with Duration Input

## Goal
Allow users to refocus a completed sub-piece by showing a confirmation dialog with an optional new duration.

## Scope
- Modify only `components/projects/SubPieceCard.tsx`.
- Modify only `components/projects/__tests__/SubPieceCard.test.tsx`.

## Required Changes
1. In `components/projects/SubPieceCard.tsx`:
   - Import dialog primitives (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`) from `@/components/ui/dialog`.
   - Import `Input` from `@/components/ui/input`.
   - Add local state `isDialogOpen` and `newAllocatedMinutes` (initialized to `subPiece.allocatedMinutes`).
   - Change the focus button logic:
     - For incomplete sub-pieces, keep the existing direct focus behavior.
     - For completed sub-pieces, open the refocus dialog.
   - Dialog content:
     - Title: `အခန်းကဏ်ဍကို ပြန်စ focus လုပ်မယ် (Refocus Sub-piece)`
     - Body: `ဒီအခန်းကဏ်ဍ ပြီးစီးသွားပါပြီ။ ပြန်စ focus လုပ်ချင်ပါသလား?` / `This sub-piece is completed. Refocus will reset its progress.`
     - Minutes input with label `ကြာချိန် မိနစ် (Duration in minutes)`.
     - Footer buttons:
       - `မလုပ်ပါ (Cancel)` — closes dialog.
       - `focus လုပ်မယ် (Refocus)` — calls `refocusSubPiece(projectId, subPiece.id, newAllocatedMinutes)`, then `setActiveProject(projectId)`, `setActiveSubPiece(projectId, subPiece.id)`, and `router.push("/timer")`.
2. In `components/projects/__tests__/SubPieceCard.test.tsx`:
   - Update the test that checks the focus button is hidden for completed sub-pieces — it should now be visible.
   - Add tests:
     - Clicking focus on a completed sub-piece opens the dialog.
     - Cancel does not call `refocusSubPiece` or navigate.
     - Confirm calls `refocusSubPiece` with the current allocated minutes, sets active project/sub-piece, and navigates.
     - Changing the input value passes the new value to `refocusSubPiece`.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/projects/__tests__/SubPieceCard.test.tsx` passes.
- [ ] No files outside the scope are modified.
