# Skill: SubPiece Card + List + ProjectCard Body Integration Build

## Purpose
Display a project's sub-pieces inside its project card.

## Scope
- **Create**
  - `components/projects/SubPieceCard.tsx`
  - `components/projects/SubPieceList.tsx`
  - `components/projects/__tests__/SubPieceList.test.tsx`
- **Modify**
  - `components/projects/ProjectCard.tsx` — render the list below the progress bar
- **Size**: Small — 4 files, ~170 lines

## References
- `.claude/memory/ui-conventions.md`
- `components/projects/ProjectCard.tsx`
- `lib/types/index.ts` — `SubPiece`, `PieceStatus`

## Steps
1. Read memory files, `ProjectCard.tsx`, and `lib/types/index.ts`.
2. Create `SubPieceCard.tsx`.
   - Props: `subPiece: SubPiece`.
   - Show: name, allocated minutes ("25 မိနစ်"), status badge.
   - Status labels in Burmese + English: idle, running, paused, completed.
   - Use compact layout; Lucide `Clock` or `CheckCircle2` icon optional.
3. Create `SubPieceList.tsx`.
   - Props: `subPieces: SubPiece[]`.
   - Render list of `SubPieceCard`.
   - Empty state: "အခန်းကဏ္ဍများ မရှိသေးပါ" / "No sub-pieces yet".
4. Create `SubPieceList.test.tsx`.
   - Test empty state renders.
   - Test list of sub-pieces renders correctly.
5. Modify `ProjectCard.tsx`.
   - Add a new section (e.g., between progress bar and footer) that renders `<SubPieceList subPieces={project.subPieces} />`.
6. Run `npx tsc --noEmit` and `npx vitest run components/projects/__tests__/SubPieceList.test.tsx`.
7. Update `.claude/memory/progress.md`.

## Rules
- Do not modify `SubPieceForm`, `AddSubPieceButton`, or store logic.
- Use existing theme colors and `cn()` for conditional classes.
- Burmese-first labels with English secondary.
- Keep cards compact since they live inside `ProjectCard`.

## Agent
- **UI Designer**

## Verification
- TypeScript compiles.
- Tests pass.
- Project cards show their sub-pieces.
- Empty state is friendly and beginner-friendly.
