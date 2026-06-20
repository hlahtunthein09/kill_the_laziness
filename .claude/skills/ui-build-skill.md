# Skill: UI Component Build

## Purpose
Build a single UI component or page for FocusFlow AI using Shadcn UI, Tailwind, and Framer Motion.

## When to Use
Creating a new component, page, or layout piece.

## References
- Context7: `/shadcn-ui/ui`
- Context7: `/grx7/framer-motion`
- Tailwind docs for v4 syntax

## Steps
1. Read `.claude/memory/ui-conventions.md`.
2. Check if needed shadcn primitive exists in `components/ui/`.
3. Create the component in the correct `components/` subfolder.
4. Use `cn()` for class merging.
5. Add Framer Motion animations for gamification moments.
6. Run `npx tsc --noEmit`.
7. Update `.claude/memory/progress.md`.

## Rules
- UI text in Burmese first, English second.
- Pastel nature colors only.
- Client components marked with `"use client"` when using hooks/state.
- Keep components focused (one responsibility).

## Verification
- TypeScript compiles.
- Component renders in dev server.
- User can read and understand all labels.
