.claude project structure, references, and Next.js shell created.

## Current Phase
Backfilling tests for Pieces 1-3 before proceeding to Piece 4. Workflow updated to require tests for every piece.

## Completed
- [x] Next.js app initialized at workspace root
- [x] shadcn/ui initialized
- [x] Dependencies installed
- [x] `.claude/` structure created
- [x] Initial data layer (3 separate stores)
- [x] Architecture research
- [x] Workflow + roadmap updated (Research → Virtual Sizing → Skill → Agent → **Test**)
- [x] Piece 1: Single Store Refactor — DONE
- [x] Piece 2a: App Shell + Layout Wrapper — DONE
- [x] Piece 2b: Sidebar + Burmese Navigation — DONE
- [x] Piece 2c: Header + Dashboard Placeholder — DONE
- [x] Piece 3: Research + Virtual Sizing — DONE
- [x] Piece 3a: Project Form Only — DONE
- [x] Piece 3b: Project Card + List + Page — DONE
- [x] **Backfill tests written and passing (38 tests, 4 files)**
  - `lib/store/__tests__/useFocusStore.test.ts` — 21 tests
  - `components/projects/__tests__/ProjectForm.test.tsx` — 6 tests
  - `components/projects/__tests__/ProjectCard.test.tsx` — 7 tests
  - `components/projects/__tests__/ProjectList.test.tsx` — 4 tests
- [x] **Workflow updated to include mandatory testing**
  - Updated `.claude/skills/main-workflow-skill.md`
  - Updated `.claude/memory/workflow.md`
  - Testing standards added

## Backfill Testing Plan

### Test Framework
- Vitest
- React Testing Library + jsdom
- @testing-library/jest-dom

### Tests to Write
1. **Piece 1 — Store tests**
   - `lib/store/__tests__/useFocusStore.test.ts`
   - Test project CRUD, sub-piece CRUD, settings, distraction logs

2. **Piece 3a — ProjectForm tests**
   - `components/projects/__tests__/ProjectForm.test.tsx`
   - Test rendering, input changes, submit adds project, validation

3. **Piece 3b — ProjectList/Card tests**
   - `components/projects/__tests__/ProjectCard.test.tsx`
   - `components/projects/__tests__/ProjectList.test.tsx`
   - Test rendering project info, empty state

### Note
Piece 2 (UI shell/layout) tests deferred for now due to lower value; will add once core features stabilize.

## Next Action
Proceed to Piece 4: Sub-piece form + list.

## Blockers
None.

## Decisions Pending
- Notification messages: Burmese-only or bilingual from start?
