# Skill: Sub-piece Budget — Form UI (Piece B)

## Goal
Surface the project budget inside `SubPieceForm` so users see remaining time and cannot save a sub-piece that exceeds the project's remaining budget. Builds on Piece A store getter `getRemainingBudgetSeconds`.

## Scope
- Modify ONLY `components/projects/SubPieceForm.tsx` and `components/projects/__tests__/SubPieceForm.test.tsx`.
- Do NOT touch the store, ProjectCard, or other files.

## Theme rule (MANDATORY)
- Support BOTH light and dark mode. Use semantic theme tokens ONLY — no hardcoded colors.
  - Helper/remaining line: `text-sm text-muted-foreground`.
  - Error text: reuse existing `text-xs text-destructive`.
- Do not introduce `bg-*`/`text-*` literal palette classes.

## Implementation (`components/projects/SubPieceForm.tsx`)
1. Read remaining budget from the store (subscribe so it updates live). Near the top of the component:
   ```
   const remainingBudgetSeconds = useFocusStore((s) => s.getRemainingBudgetSeconds(projectId));
   const remainingMinutes = Math.floor(remainingBudgetSeconds / 60);
   ```
   (If a selector returning a computed value causes re-render churn, reading via `useFocusStore((s) => s.getRemainingBudgetSeconds(projectId))` is fine here since the form is short-lived.)
2. Under the Allocated Minutes input (below the input, above/around the error), add a helper line showing remaining time. Burmese label EXACTLY: `Project အတွက်ကျန်ရှိသော အချိန်`.
   ```
   <p className="text-sm text-muted-foreground">
     Project အတွက်ကျန်ရှိသော အချိန်: {remainingMinutes} မိနစ်
   </p>
   ```
3. Validation in `handleSubmit`: after the existing positive-integer check, block over-budget:
   ```
   else if (allocatedMinutes > remainingMinutes) {
     newErrors.allocatedMinutes = "ကျန်ရှိသော budget ထက် ကျော်လွန်နေပါသည်";
   }
   ```
   Keep the existing `<= 0` / non-integer check as-is; the over-budget check is additional.
4. Disable Save when budget is full (`remainingMinutes <= 0`):
   - `<Button type="submit" disabled={remainingMinutes <= 0}>...`
   - Optionally show the helper line in destructive tone when full, but keep it simple: the disabled button + helper line (0 မိနစ်) is enough.

## Tests (`components/projects/__tests__/SubPieceForm.test.tsx`)
Follow the existing test setup pattern in that file (store reset, seeding a project with a target). Add tests:
- Helper line renders remaining minutes: seed project `targetTimeSeconds` 3600, no sub-pieces → shows `Project အတွက်ကျန်ရှိသော အချိန်: 60 မိနစ်`.
- Over-budget blocks Save: remaining 60 min, enter 90 → error shown, `addSubPiece` NOT called / no sub-piece added.
- Full budget disables Save: seed sub-pieces summing to target (remaining 0) → Save button disabled.
- Within budget still saves (keep/adapt existing happy-path test).
- Keep all existing SubPieceForm tests passing.

## Verify (piece NOT done until both pass)
- `npx tsc --noEmit`
- `npx vitest run components/projects/__tests__/SubPieceForm.test.tsx`

## Done criteria
Helper line shows remaining budget in both themes (semantic tokens), over-budget entry is blocked, full budget disables Save; both verifications pass.
