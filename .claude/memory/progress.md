.claude project structure, references, and Next.js shell created.

## Current Phase
Piece 4 split into 4a/4b/4c. Workflow and memory structure updated for token-efficient, memory-first development.

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
- [x] **Source-of-truth cleanup**
  - Removed root `CLAUDE.md` and `AGENTS.md`
  - `.claude/CLAUDE.md` now contains non-negotiable workflow rules + framework note
- [x] **Memory-first workflow established**
  - Created `.claude/memory/MEMORY.md` index
  - Created `.claude/memory/ui-conventions.md`
  - Created `.claude/memory/store-schema.md`
  - Updated `.claude/memory/workflow.md` to compact, memory-first steps

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

## Piece 4: Research + Virtual Sizing (in progress)

### Research Findings
- Store layer already supports sub-piece CRUD (`addSubPiece`, `updateSubPiece`, `deleteSubPiece`, `reorderSubPieces`, etc.) in `lib/store/slices/projectSlice.ts`.
- Existing `ProjectForm` uses manual `useState` + inline validation (no react-hook-form/Zod). Reusing this pattern keeps Piece 4 small and consistent.
- shadcn/ui Dialog/Form/Input/Select docs confirm the same primitives already used in `ProjectForm` are sufficient.
- Zustand selectors/actions pattern is already used in `ProjectList` (`useFocusStore((s) => s.projects)`).
- No new page or hook is strictly required if sub-pieces are displayed inside `ProjectCard`.

### Virtual Sizing — Original Piece 4
- New files: `SubPieceForm.tsx`, `SubPieceList.tsx`, `SubPieceCard.tsx`, `AddSubPieceButton.tsx`, plus 2-3 test files.
- Modified files: `ProjectCard.tsx`, `app/projects/page.tsx`.
- Estimated total: ~8 files, ~450 lines.
- **Verdict: ❌ Too Big** (>6 files, >400 lines).

### Proposed Split (keep each piece ≤200 lines / Small)
- **Piece 4a — SubPiece Form Only** ✅ Small
  - Create `SubPieceForm.tsx`, `SubPieceForm.test.tsx`.
  - Focus: dialog form to add a sub-piece (name + allocated minutes + projectId prop).
- **Piece 4b — Add SubPiece Button + ProjectCard Footer Integration** ✅ Small
  - Create `AddSubPieceButton.tsx`, `AddSubPieceButton.test.tsx`.
  - Modify `ProjectCard.tsx` footer to open the sub-piece form for that project.
  - Focus: trigger to add sub-pieces from a project card.
- **Piece 4c — SubPiece Card + List + ProjectCard Body Integration** ✅ Small
  - Create `SubPieceCard.tsx`, `SubPieceList.tsx`, `SubPieceList.test.tsx`.
  - Modify `ProjectCard.tsx` body to show the list of sub-pieces.
  - Focus: display sub-pieces under each project.

## Next Action
Piece 4a done. Proceed to Piece 4b after user review.

## Blockers
None.

## Decisions Pending
- Notification messages: Burmese-only or bilingual from start?
- Sub-piece form integration point: `ProjectCard` footer vs. separate project detail page? (tentatively ProjectCard footer for 4b)

## Latest Update
- Piece 4a complete: `SubPieceForm.tsx` + `SubPieceForm.test.tsx` created; 7 tests passing; TypeScript clean.
- Piece 4b complete: `AddSubPieceButton.tsx` + `AddSubPieceButton.test.tsx` created; `ProjectCard.tsx` footer updated; 2 tests passing; TypeScript clean.
- Piece 4c complete: `SubPieceCard.tsx`, `SubPieceList.tsx`, `SubPieceList.test.tsx` created; `ProjectCard.tsx` body renders sub-pieces below progress bar; 3 tests passing; TypeScript clean.

## Piece 5: Research + Virtual Sizing (in progress)

### Research Findings
- Timer must be a client hook (`"use client"`) using `useEffect` + `requestAnimationFrame`.
- `requestAnimationFrame` + `Date.now()` delta gives accurate timing even when tab is throttled; `setInterval` is not reliable.
- Zustand `persist` middleware can store transient timer state, but a dedicated `ff_active_session` localStorage key is simpler for an active session.
- On mount/rehydrate, compare `savedAt` timestamp to `Date.now()` to calculate drift and fast-forward elapsed time.
- Store actions `incrementProjectTime`, `incrementSubPieceTime`, and `completeSubPiece` already exist in `projectSlice`.
- No timer slice exists yet in `useFocusStore`; the hook can own the active session state and call existing actions.

### Virtual Sizing — Piece 5
| Metric | Estimate |
|---|---|
| New files | 2 (`hooks/useTimer.ts`, `hooks/__tests__/useTimer.test.ts`) |
| Modified files | 0 |
| Hooks | 1 |
| Pages | 0 |
| Est. lines | ~200-250 |
| Verdict | ⚠️ Small → Medium (borderline; timer logic is dense) |

### Proposed Approach
Build a single focused `useTimer` hook that:
- Accepts `projectId` and optional `subPieceId`.
- Counts project time up and sub-piece time down.
- Persists active session every 5 seconds to `ff_active_session`.
- Restores + drift-corrects on mount.
- Auto-pauses and marks sub-piece complete at zero.
- Returns `isRunning`, `start`, `pause`, `reset`, `projectElapsed`, `subPieceRemaining`.

- [x] **Piece 5: Timer Engine Hook** — DONE
  - `hooks/useTimer.ts` created (RAF-based, drift-corrected, localStorage persistence)
  - `hooks/__tests__/useTimer.test.tsx` created (18 tests, all passing)
  - TypeScript clean, 67/67 tests passing across all suites

## Next Action
Piece 5 complete. Proceed to Piece 6 after user review.

## Blockers
None.

## Decisions Pending
- Timer state ownership: dedicated hook localStorage vs. new Zustand timer slice? (proposed: hook localStorage)
- Notification messages: Burmese-only or bilingual from start?
