# Skill: Main Workflow for FocusFlow AI

## Who Uses This
Claude Code (main agent) when building FocusFlow AI with the user.

## Purpose
Ensure piece-by-piece, reference-first, user-confirmed development with tests for every piece.

## Workflow (MUST FOLLOW)

### 1. Select Piece
Choose one piece from the roadmap. Never implement multiple pieces silently.

### 2. Research First
Before virtual sizing or writing skills:
- Query Context7 MCP for relevant library docs.
- Use WebSearch/WebFetch/GitHub MCP to study real examples from `.claude/references.md`.
- Summarize findings in `.claude/memory/progress.md` under "Research Notes".

### 3. Virtual Sizing Review
Before building a skill, estimate the whole piece size:
- How many files will be created/modified/deleted?
- How many UI components?
- How many store slices/hooks?
- How many pages/routes?
- Estimated lines of code?

**Sizing thresholds:**
- ✅ **Small**: ≤3 new files, ≤1 page, ≤1 hook, ≤200 lines
- ⚠️ **Medium**: ≤6 new files, ≤2 pages, ≤2 hooks, ≤400 lines
- ❌ **Too Big**: >6 files, >2 pages, >2 hooks, or >400 lines

If the piece is **Too Big** or **Medium with risk**, split it into smaller sub-pieces BEFORE building the skill. Update the roadmap in `.claude/memory/workflow.md` and `.claude/memory/progress.md`.

### 4. Update Skill
After sizing is finalized, create/update the skill for the (sub-)piece in `.claude/skills/`:
- Add concrete reference URLs/snippets.
- Add specific code patterns.
- Add scope (files to create/modify).
- Add verification steps.
- **Add testing strategy**: what test file(s) to write and what to test.

### 5. Report Ready State to User
Tell the user:
- What piece is next.
- What references were studied.
- What skill will be used.
- Which agent will be spawned.
- Estimated size.
- **Testing plan**.
- Ask for confirmation.

### 6. Spawn Agent + Implement + Test
Only after user confirmation, spawn the subagent with the skill instructions.

The agent MUST:
1. Implement the piece.
2. Write test file(s) for the implemented code.
3. Run the test suite and ensure tests pass.

### 7. Verify
- Run `npx tsc --noEmit`.
- Run `npm run dev` briefly if needed.
- Run tests: `npm test` or `npx vitest run`.
- Test the specific feature manually if needed.

### 8. Update Memory
Update `.claude/memory/progress.md` and `.claude/memory/conventions.md`.

### 9. User Review
Explain what was built, what was tested, and how to test. Wait for approval before next piece.

## Critical Rules
- NEVER implement without user confirmation.
- NEVER skip research before virtual sizing.
- NEVER skip virtual sizing before building/updating a skill.
- NEVER skip skill before spawning an agent.
- **NEVER skip writing tests for a piece.** Every piece must have tests.
- **ALWAYS run tests before reporting completion.**
- ALWAYS keep UI text Burmese-first, English-secondary.
- ALWAYS update progress.md after each step.
- If context limit is hit, new chat reads `.claude/memory/progress.md` first.

## Testing Standards

### Store/Logic Tests
- Use Vitest.
- Test actions change state correctly.
- Test persistence if applicable.
- Test edge cases (empty input, invalid values).

### Component Tests
- Use React Testing Library + jsdom.
- Test rendering.
- Test user interactions (click, type, submit).
- Test empty states.

### Test File Naming
- Store tests: `lib/store/__tests__/useFocusStore.test.ts`
- Component tests: `components/projects/__tests__/ProjectForm.test.tsx`

## Project Context Reminder
FocusFlow AI = Todo List + Timer + Motivated Speech Notifications.
- Web app: Next.js + Tailwind + shadcn/ui.
- Extension: Manifest V3 for off-screen notifications.
- UI: Burmese-first, beginner-friendly, pastel nature theme.
