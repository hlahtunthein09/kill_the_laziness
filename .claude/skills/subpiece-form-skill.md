# Skill: SubPiece Form Only Build

## Purpose
Create a dialog form for adding a `SubPiece` to an existing project.

## Scope
- **Create**
  - `components/projects/SubPieceForm.tsx`
  - `components/projects/__tests__/SubPieceForm.test.tsx`
- **Modify**: none
- **Size**: Small — 2 files, ~120 lines

## References
- `.claude/memory/ui-conventions.md` — current form pattern
- `.claude/memory/store-schema.md` — `addSubPiece` action
- `components/projects/ProjectForm.tsx` — manual validation pattern
- `lib/types/index.ts` — `SubPiece` type

## Steps
1. Read memory files, `ProjectForm.tsx`, and `lib/types/index.ts`.
2. Create `SubPieceForm.tsx` as a `"use client"` component with props:
   ```ts
   interface SubPieceFormProps {
     open: boolean;
     onOpenChange: (open: boolean) => void;
     projectId: string;
   }
   ```
3. Fields (Burmese-first labels):
   - "အခန်းကဏ္ဍအမည် (Sub-piece Name)" — required text
   - "ခဏထားချိန် မိနစ် (Allocated Minutes)" — required positive integer
4. Validation: inline errors in Burmese.
5. On submit:
   ```ts
   const project = useFocusStore.getState().getProjectById(projectId);
   const order = project?.subPieces.length ?? 0;
   useFocusStore.getState().addSubPiece({
     projectId,
     name: name.trim(),
     allocatedMinutes,
     order,
   });
   ```
   Then reset and close.
6. Tests:
   - Seed store with one project.
   - Render form, fill fields, submit → sub-piece added.
   - Test empty name and invalid minutes errors.
   - Test close resets form.
7. Run `npx tsc --noEmit` and `npx vitest run components/projects/__tests__/SubPieceForm.test.tsx`.
8. Update `.claude/memory/progress.md`.

## Rules
- Reuse existing `useState` + manual validation pattern.
- No new store logic; only call `addSubPiece`.
- No new pages or layout changes.
- Use `cn()` and pastel nature theme if styling is needed.

## Agent
- **UI Designer**

## Verification
- TypeScript compiles.
- Tests pass.
- Submitting the form adds a sub-piece to the correct project.
