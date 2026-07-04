<!-- ch-3 personal-project report. Copy this file to ch-3/<your-github-username>/report.md -->
<!-- Before you pass: your project repo needs at least 3 GitHub stars (ask teammates
     to open your repo and click ⭐). This proves it is a real, shared project. -->

# ch-3 Personal Project — Report

github_username: hlahtunthein09
personal_repo_url: https://github.com/hlahtunthein09/kill_the_laziness
project_summary: A gamified Next.js productivity dashboard + Manifest V3 browser extension that tracks focused work through projects and sub-pieces, blocks distracting sites, and motivates users with XP, streaks, and a growing dev-fortress.
slides_url: slides/pitch.md

## Methodology

Built using a piece-by-piece, user-confirmed workflow. Each feature (project/sub-piece CRUD, timer engine, browser extension, native notifications, gamification, scheduled focus sessions) was researched, scoped with a virtual-sizing table, implemented with tests, and verified before moving to the next piece. Git commits follow Conventional Commits format with descriptive messages. Claude Code was used throughout for code generation, architecture decisions, UI/UX iteration, test writing, and memory management. The project evolved from a basic project timer into a full productivity ecosystem spanning a Next.js dashboard and a browser extension.

## Evidence — Claude Code usage

### MCP

- path: .claude/mcp.json
- what: MCP server registry used during development — **context7** for library docs (Next.js, Zustand, Framer Motion, shadcn/ui, WXT, webextension-polyfill), **ctxai** for package-safety validation, **github** for branch/PR/issue operations, and **playwright** (also configured in `.mcp.json`) for browser automation and live UI verification.

### Skill

- path: .claude/skills/frontend-layout/SKILL.md
- what: Master skill for the Next.js app shell — AppShell, Sidebar, Header, dashboard layout, theme/dark-mode wiring, and global providers. Defines Burmese-first labels, the pastel nature palette, hydration safety, and reusable page patterns.

- path: .claude/skills/projects-timer/SKILL.md
- what: Master skill for project/sub-piece CRUD, the timer engine (`useTimer`), timer UI components (`TimerPanel`, `TimerDisplay`, `TimerControls`, `TimerToast`), and focus-session completion/refocus flows. Covers store actions, budget enforcement, drift correction, and extension bridge events.

- path: .claude/skills/extension-notifications/SKILL.md
- what: Master skill for the WXT Manifest V3 extension — background service worker, timer engine, native OS notifications, content scripts, popup UI, anti-distraction tab monitoring/redirect, and warn-mode overlay. Defines the off-screen notification architecture and permission-checked notification patterns.

- path: .claude/skills/settings-gamification/SKILL.md
- what: Master skill for the settings page/toggles, daily focus goal, streak counter, XP/fortress gamification, distraction log, JSON import/export sync, and scheduled focus sessions. Covers motivation message tiers and notification copy conventions.

- path: .claude/skills/core-data-workflow/SKILL.md
- what: Master skill for domain types, Zustand store architecture, agent workflow rules, cross-cutting refactors, and generic coding conventions. Serves as the meta skill for maintaining consistency across the codebase.

### Agent

- path: .claude/agents/core-architect.md
- what: Owns the data layer, state management, timer engine, and sync protocol. Used to design `lib/types/index.ts`, `lib/store/*` slices, `hooks/useTimer.ts`, and the web/extension sync protocol.

- path: .claude/agents/ui-designer.md
- what: Builds the user interface — layout, shadcn/ui primitives, Framer Motion animations, project/timer presentational components, and theme styling. Ensures Burmese-first, accessible, pastel-nature design.

- path: .claude/agents/extension-engineer.md
- what: Builds the Manifest V3 browser extension for off-screen notifications and anti-distraction. Used for `extension/*`, service worker, content scripts, popup UI, and WXT build verification.

- path: .claude/agents/notification-copywriter.md
- what: Generates motivational notification messages and in-app encouragement text. Used to maintain Burmese-first, English-secondary, tiered motivational copy across `lib/motivation.ts` and `extension/lib/motivation.ts`.
