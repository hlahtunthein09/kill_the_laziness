# Skill: Sub-piece Detail Dialog Animation (Piece 3)

## Goal
Add a smooth appear/disappear animation to the sub-piece detail dialog.

## Scope
- Modify `components/projects/SubPieceCard.tsx`.
- No test changes expected unless animation library usage breaks selectors.

## Required Changes
1. Add a smooth transition when the detail dialog opens and closes.
2. Prefer Framer Motion (`AnimatePresence` + `motion.div`) if already in the project dependencies.
3. Alternative: use Tailwind `animate-in` / `animate-out` utilities or CSS keyframes if Framer Motion is unavailable.
4. Keep the existing refocus dialog animation unchanged.

## Test Strategy
- Run `npx vitest run components/projects/__tests__/SubPieceCard.test.tsx`.
- Ensure existing tests still pass.

## Verification
- TypeScript clean.
- All SubPieceCard tests pass.
