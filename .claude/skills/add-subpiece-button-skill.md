# Skill: Add SubPiece Button + ProjectCard Footer Integration Build

## Purpose
Add a button to each project card that opens the existing `SubPieceForm` dialog for that project.

## Scope
- **Create**
  - `components/projects/AddSubPieceButton.tsx`
  - `components/projects/__tests__/AddSubPieceButton.test.tsx`
- **Modify**
  - `components/projects/ProjectCard.tsx` — add the button to the footer
- **Size**: Small — 3 files, ~100 lines

## References
- `.claude/memory/ui-conventions.md`
- `components/projects/AddProjectButton.tsx` — existing button pattern
- `components/projects/SubPieceForm.tsx` — dialog to open
- `components/projects/ProjectCard.tsx` — footer to modify

## Steps
1. Read memory files and the reference components above.
2. Create `AddSubPieceButton.tsx` as a `"use client"` component.
   - Props: `projectId: string`, optional `className`.
   - Use `useState` to manage dialog open state.
   - Render a `Button` with a Plus icon and label `"အခန်းကဏ္ဍအသစ်ထည့်ရန် (Add Sub-piece)"`.
   - Render `<SubPieceForm open={open} onOpenChange={setOpen} projectId={projectId} />`.
3. Create `AddSubPieceButton.test.tsx`.
   - Test that the button renders.
   - Test that clicking the button opens the `SubPieceForm` dialog (check for dialog title text).
4. Modify `ProjectCard.tsx` footer to render `<AddSubPieceButton projectId={project.id} />`.
5. Run `npx tsc --noEmit` and `npx vitest run components/projects/__tests__/AddSubPieceButton.test.tsx`.
6. Update `.claude/memory/progress.md`.

## Rules
- Do not modify `SubPieceForm` or store logic.
- Keep the button compact; use the existing `Button` + icon pattern.
- Burmese-first label with English in parentheses.
- Use `cn()` if class merging is needed.

## Agent
- **UI Designer**

## Verification
- TypeScript compiles.
- Tests pass.
- Each project card footer shows the Add Sub-piece button.
- Clicking it opens the sub-piece form dialog.
