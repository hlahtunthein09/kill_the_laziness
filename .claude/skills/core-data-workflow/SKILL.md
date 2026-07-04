# Master Skill: Core Data, Workflow & Refactors

## Purpose
Maintain the foundational data layer, agent workflow conventions, cross-cutting refactors, and generic patterns that span the whole FocusFlow AI codebase.

## Scope
- Domain types (`lib/types/index.ts`)
- Zustand store architecture (`lib/store/useFocusStore.ts` and slices)
- Agent workflow rules for building pieces with the user
- Cross-cutting refactors (single-store refactor, rehydration, import paths)
- Generic UI build patterns
- Constants and utilities

## Key Files
- `.claude/CLAUDE.md`
- `.claude/memory/workflow.md`
- `.claude/memory/conventions.md`
- `.claude/memory/progress.md`
- `lib/types/index.ts`
- `lib/constants.ts`
- `lib/utils.ts`
- `lib/store/useFocusStore.ts`
- `lib/store/slices/*.ts`
- `components/providers/StoreHydrationProvider.tsx`

## Architecture Conventions

### Data Model
- Domain types live in `lib/types/index.ts`.
- Key entities: `Project`, `SubPiece`, `AppSettings`, `AntiDistractionLog`, `FocusSessionSchedule`.
- Types are the source of truth; keep slices aligned with type changes.

### Store
- Single Zustand store `useFocusStore` composed of slices via `zustand`'s `persist` middleware.
- Slices: `projectSlice`, `settingsSlice`, `scheduleSlice`, `logSlice`.
- Storage key prefix: `ff_`.
- Use `useFocusStore((s) => s.selector)` for reads.
- Use `useFocusStore.getState().action()` inside callbacks/events.

### Agent Workflow
1. Read memory first (`CLAUDE.md`, `conventions.md`, `progress.md`, `workflow.md`).
2. Research only when a new primitive/pattern is needed.
3. Virtual sizing: report new/modified files, hooks, pages, estimated lines.
4. Get user approval before creating/updating skills or implementing.
5. Spawn agent + implement + tests.
6. Verify with `npx tsc --noEmit` and targeted tests.
7. Update `progress.md` (and `conventions.md` only if conventions change).
8. Wait for user review before next piece.

### Coding Conventions
- Client components for state/timer/localStorage: use `"use client"`.
- Hydration safety: lazy state initialization, `suppressHydrationWarning`.
- Class merging: use `cn()`.
- Time values: store in seconds, format at display time.
- Component naming: PascalCase; hooks/utilities: camelCase.
- Burmese-first UI labels.

### Utilities
- `lib/utils.ts`: `cn()`, `generateId()`, etc.
- `lib/time.ts`: `formatDuration()`, time helpers.
- `lib/constants.ts`: XP values, thresholds, default settings, forbidden URLs.

## Implementation Checklist

1. Read `.claude/CLAUDE.md` and `.claude/memory/conventions.md` before any cross-cutting change.
2. When changing types, update all slices and dependent components/tests.
3. When refactoring, run the full test suite to catch regressions.
4. Keep memory files up to date with rationale and status.

## Testing Strategy
- Store integration tests: `lib/store/__tests__/useFocusStore.test.ts`.
- Type-level tests: `npx tsc --noEmit`.
- Utility tests: `lib/__tests__/*`.
- After refactors, run `npm test`.

## Agent Notes
- This skill is meta; use it together with one of the domain master skills when a change touches multiple areas.
- Never skip memory reading at the start of a session.
- Never implement without explicit user confirmation.
- Never skip tests or treat them as optional.
- When in doubt, split a large change into smaller approved pieces.
- Obsolete per-feature skills may exist in `.claude/skills/`; prefer these master skills and update them instead of adding new tiny skills.
