# Skill: Sub-piece Detail Dialog (Piece 2)

## Goal
Make the sub-piece row body clickable to open a detail dialog showing full sub-piece info and a Focus button.

## Scope
- Modify `components/projects/SubPieceCard.tsx`.
- Update `components/projects/__tests__/SubPieceCard.test.tsx`.
- No animation yet (Piece 3).

## Required Changes
1. Wrap the sub-piece row body in a clickable container.
2. Ensure clicking the existing Focus button does NOT open the detail dialog (use `stopPropagation`).
3. Add a new `Dialog` for sub-piece details:
   - Full sub-piece name
   - Allocated minutes
   - Elapsed / time taken
   - Status badge (Burmese + English)
   - Focus button
4. Manage dialog open state with `useState`.
5. Clicking Focus in the detail dialog behaves the same as the inline Focus button.

## Test Strategy
- Add test: clicking the row body opens the detail dialog.
- Add test: clicking the inline Focus button does NOT open the detail dialog.
- Add test: detail dialog shows full name, allocated minutes, elapsed time, status.
- Run `npx vitest run components/projects/__tests__/SubPieceCard.test.tsx`.

## Verification
- TypeScript clean.
- All SubPieceCard tests pass.
