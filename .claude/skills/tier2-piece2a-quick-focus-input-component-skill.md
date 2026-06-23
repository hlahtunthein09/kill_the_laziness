# Skill: Tier 2 Piece 2a — Quick Focus Input Component

## Goal
Create a quick-focus input component that lets the user type a task name and immediately create a sub-piece under the active/default project.

## Files to Read
1. `lib/store/useFocusStore.ts`
2. `lib/store/slices/projectSlice.ts` (for `addSubPiece`, `setActiveProject`, `updateSubPieceStatus`)
3. `components/projects/AddProjectButton.tsx` or `components/projects/ProjectCard.tsx` (for default project / auto-create pattern)

## Files to Create
1. `components/timer/QuickFocusInput.tsx`
2. `components/timer/__tests__/QuickFocusInput.test.tsx`

## Files to Modify
None.

## Implementation Details
- `QuickFocusInput` reads from `useFocusStore`:
  - `projects`
  - `activeProjectId`
  - `addSubPiece`
  - `setActiveProject`
  - `updateSubPieceStatus`
- Behavior on submit:
  1. If no projects exist, create a default project first (use same logic as elsewhere: name `"အထွေထွေ focus (General Focus)"`).
  2. Determine target project: active project if exists, otherwise first project (or the newly created default).
  3. Create a sub-piece under that project with:
     - `name`: the user’s typed task (fallback `"အထွေထွေ focus (General Focus)"` if empty)
     - `allocatedMinutes`: default 25 (pomodoro work duration)
     - `order`: `project.subPieces.length`
  4. Set the new sub-piece status to `"idle"` (it already defaults to idle).
  5. Ensure `activeProjectId` points to the target project.
- UI:
  - Input with placeholder: `"အခု focus လုပ်မယ့် အလုပ် ဘာလဲ? (What will you focus on?)"`
  - Start button with play icon: `"စတင်မယ် (Start)`"
  - Use `Button` and `Input` from shadcn/ui if available; otherwise native styled elements.
  - Disabled state while input is empty.

## Test Strategy
- Test: renders input and start button.
- Test: typing enables the start button.
- Test: submit creates a sub-piece under the active project.
- Test: submit creates default project first when no projects exist.
- Test: empty input uses fallback task name.

Run:
1. `npx vitest run components/timer/__tests__/QuickFocusInput.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `QuickFocusInput` component created
- [ ] Component creates sub-piece on submit
- [ ] Component creates default project when none exist
- [ ] Component tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 60 lines total.
- No navigation in this piece — that is Piece 2b.
- No page integration in this piece — that is Piece 2b.
- Burmese-first labels, English subtitle.
