# SDD Workflow for FocusFlow AI

This document defines the piece-by-piece workflow we follow for building FocusFlow AI.

## Project Definition

FocusFlow AI = **Todo List + Timer + Motivated Speech Notifications**

- Web app: Next.js + Tailwind + shadcn/ui
- Extension: Manifest V3 for off-screen notifications
- UI: Burmese-first, beginner-friendly, pastel nature theme

## Principles

1. **One tiny piece at a time.** Finish, verify, test, and get user approval before the next.
2. **User is a beginner.** Explain each step concisely. No silent implementation marathons.
3. **Burmese-first UI.** All user-facing text is in Burmese; English is secondary.
4. **Memory-first research.** Reuse findings from `.claude/memory/`. Query Context7/WebFetch only for genuinely new primitives or patterns.
5. **Virtual size before skill.** Estimate in one short table. Split if >3 new files, >1 page, >1 hook, or >200 lines.
6. **Skill-driven agents.** Each (sub-)piece uses a documented skill template and a specialized subagent.
7. **Test every piece.** Every implementation must include tests that pass.
8. **Memory is source of truth.** Progress, conventions, and specs live in `.claude/memory/` and are indexed by `.claude/memory/MEMORY.md`.
9. **Update progress after every piece.** One-line status updates in `.claude/memory/progress.md`.
10. **Save tokens.** Re-read files only when memory is stale; keep chat responses short and ask one confirmation question per turn.

## Workflow Steps (for every piece)

### 1. Read Memory
Start every piece by reading `.claude/CLAUDE.md`, `.claude/memory/MEMORY.md`, `.claude/memory/conventions.md`, `.claude/memory/progress.md`, and this file.

### 2. Select Piece
Choose the next piece from the roadmap below.

### 3. Research
- Check whether memory already covers the needed pattern.
- If yes, reference memory and skip Context7.
- If a new primitive is needed, run one targeted Context7/WebFetch query.
- Summarize only new findings in `.claude/memory/progress.md`.

### 4. Virtual Sizing Review
Report in one table before building a skill:

| Metric | Value |
|---|---|
| New files | n |
| Modified files | n |
| Hooks | n |
| Pages | n |
| Est. lines | n |
| Verdict | Small / Medium / Too Big |

**Sizing thresholds:**
- ✅ **Small**: ≤3 new files, ≤1 page, ≤1 hook, ≤200 lines
- ⚠️ **Medium**: ≤6 new files, ≤2 pages, ≤2 hooks, ≤400 lines
- ❌ **Too Big**: >6 files, >2 pages, >2 hooks, or >400 lines

If too big, split BEFORE building the skill and update the roadmap.

### 5. Build/Update Skill
After scope is finalized, create/update the skill in `.claude/skills/`. Do not paste the full skill in chat.

### 6. Report Ready State
One concise message with:
- Piece name
- Skill file path
- Agent type
- Test plan
- Ask for confirmation

### 7. Spawn Agent + Implement + Test
Only after explicit user confirmation. The agent must implement AND write tests.

### 8. Verify
- Run `npx tsc --noEmit`.
- Run `npm run dev` briefly if UI changed.
- Run tests (`npx vitest run <test-file>` or `npm test`).

### 9. Update Memory
- Append one-line status to `.claude/memory/progress.md`.
- Update `.claude/memory/conventions.md` only if conventions changed.

### 10. User Review
Explain what was built and tested. Wait for explicit approval before the next piece.

## Approved Piece Roadmap

### Phase 1: Foundation
1. **Single Store Refactor** ✅

### Phase 2: Web App UI
2. **App shell + မြန်မာလို navigation** ✅
   - 2a: App Shell + Layout Wrapper ✅
   - 2b: Sidebar + Burmese navigation ✅
   - 2c: Header + dashboard placeholder ✅

### Phase 3: Project Management
3. **Project form + list** ✅
   - 3a: Project Form ✅
   - 3b: Project Card + List + Page ✅

### Phase 4: Sub-Pieces
4. Sub-piece form + list ← split into small pieces
   - 4a: SubPiece Form Only
   - 4b: Add SubPiece Button + ProjectCard Footer Integration
   - 4c: SubPiece Card + List + ProjectCard Body Integration

### Phase 5: Timer
5. Timer engine hook
6. Timer display + controls

### Phase 6: Motivation
7. Motivation message bank
8. Toast notification UI

### Phase 7: Extension
9. Extension WXT setup
10. Background timer sync
11. Tab monitoring + block/warn
12. Off-screen notifications
13. Extension popup

### Phase 8: Future (After MVP)
- Gamification / Dev-Fortress
- Analytics charts
- Activity heatmap
- Achievements
- Export/import

## Testing Standards

### Test Framework
- **Vitest** for unit/integration tests.
- **React Testing Library** + **jsdom** for component tests.
- **@testing-library/jest-dom** for matchers.

### What to Test
- **Stores**: actions, state changes, persistence behavior.
- **Components**: rendering, user interactions, empty states.
- **Hooks**: return values, side effects.

### Test File Locations
- Store tests: `lib/store/__tests__/*.test.ts`
- Component tests: `components/**/__tests__/*.test.tsx`
- Hook tests: `hooks/__tests__/*.test.ts`

## New Chat Onboarding

If context limit is hit and a new chat starts, read these files in order:
1. `.claude/CLAUDE.md`
2. `.claude/references.md`
3. `.claude/memory/workflow.md`
4. `.claude/memory/progress.md`
5. `.claude/memory/conventions.md`
6. `.claude/memory/architecture-research.md`
