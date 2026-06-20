# SDD Workflow for FocusFlow AI

This document defines the piece-by-piece workflow we follow for building FocusFlow AI.

## Project Definition

FocusFlow AI = **Todo List + Timer + Motivated Speech Notifications**

- Web app: Next.js + Tailwind + shadcn/ui
- Extension: Manifest V3 for off-screen notifications
- UI: Burmese-first, beginner-friendly, pastel nature theme

## Principles

1. **One tiny piece at a time.** Finish, verify, test, and get user approval before the next.
2. **User is a beginner.** Explain each step. No silent implementation marathons.
3. **Burmese-first UI.** All user-facing text is in Burmese; English is secondary.
4. **References first.** Every piece starts by studying real examples via MCP/WebFetch.
5. **Virtual size before skill.** Estimate the whole piece first, split if too big, then build the skill.
6. **Skill-driven agents.** Each (sub-)piece uses a documented skill template and a specialized subagent.
7. **Test every piece.** Every implementation must include tests that pass.
8. **Memory is source of truth.** Progress, conventions, and specs live in `.claude/memory/`.
9. **Update progress after every discussion.** Every decision, plan change, or research finding is recorded in `.claude/memory/progress.md`.

## Workflow Steps (for every piece)

### 1. Select Piece
Choose the next piece from the roadmap below.

### 2. Research
- Query Context7 MCP for relevant library docs.
- Use WebSearch/WebFetch/GitHub MCP to study real examples.
- Summarize findings in `.claude/memory/progress.md`.

### 3. Virtual Sizing Review
Estimate the whole piece size BEFORE building a skill:
- How many files will be created/modified/deleted?
- How many UI components?
- How many store slices/hooks?
- How many pages/routes?
- Estimated lines of code?

**Sizing thresholds:**
- ✅ **Small**: ≤3 new files, ≤1 page, ≤1 hook, ≤200 lines
- ⚠️ **Medium**: ≤6 new files, ≤2 pages, ≤2 hooks, ≤400 lines
- ❌ **Too Big**: >6 files, >2 pages, >2 hooks, or >400 lines

If too big, split the piece BEFORE building the skill. Update roadmap.

### 4. Build/Update Skill
Create/update the skill for the final (sub-)piece in `.claude/skills/`. Include testing strategy.

### 5. Report Ready State
Tell the user:
- What piece is next
- What references were studied
- What skill will be used
- Which agent will be spawned
- Estimated size
- Testing plan
- Ask for confirmation

### 6. Spawn Agent + Implement + Test
Only after user confirmation, spawn the subagent. The agent must implement AND write tests.

### 7. Verify
- Run `npx tsc --noEmit`.
- Run `npm run dev` briefly.
- **Run tests** (`npm test` or `npx vitest run`).
- Test the specific feature manually if needed.

### 8. Update Memory
Update `.claude/memory/progress.md` and `.claude/memory/conventions.md`.

### 9. User Review
Explain what was built and tested. Wait for approval before next piece.

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
4. Sub-piece form + list ← current

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
