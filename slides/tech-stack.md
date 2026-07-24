---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- slide 1 — cover -->

# FocusFlow AI

**Kill The Laziness — a gamified productivity dashboard + browser extension that blocks distractions and tracks focus time.**

Built with Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Claude Code

🔗 https://kill-the-laziness.vercel.app
📦 https://github.com/hlahtunthein09/kill_the_laziness/releases/tag/v0.1.0

---

<!-- slide 2 — tech stack -->

# Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| **Framework**      | Next.js 16 App Router + React 19                |
| **Language**       | TypeScript 5                                    |
| **Styling**        | Tailwind CSS 4 + shadcn/ui                      |
| **Animation**      | Framer Motion + canvas-confetti                 |
| **State**          | Zustand 5 (with persist middleware)             |
| **Charts**         | Recharts (via shadcn/ui charts)                 |
| **Icons**          | Lucide React                                    |
| **Extension**      | WXT (Manifest V3) + webextension-polyfill       |
| **Testing**        | Vitest + React Testing Library                  |
| **Deploy**         | Vercel (web app) · GitHub Releases (extension)  |

---

<!-- slide 3 — agents -->

# Agents

- **core-architect** — validates data-model decisions, store slices, and cross-layer dependencies; runs before every major feature to catch type/state design issues early
- **extension-engineer** — builds the Manifest V3 browser extension: service worker, content scripts, popup UI, and off-screen notification engine
- **ui-designer** — implements UI components following the pastel nature theme; ensures hydration safety, Burmese-first labels, and responsive layout
- **notification-copywriter** — writes notification copy for the percentage-based milestone system (Start / Milestone / Almost Done / Complete)

---

<!-- slide 4 — skills -->

# Skills

- **projects-timer** — blueprint for project/sub-piece CRUD, timer engine (`useTimer` hook with drift correction), timer UI panel, and completion/refocus flows
- **frontend-layout** — blueprint for the app shell layout: sidebar, header, responsive grid, and navigation structure with shadcn/ui primitives
- **core-data-workflow** — blueprint for Zustand store slices, domain types, constants, and data-persistence layer
- **settings-gamification** — blueprint for settings panel, XP/level system, fortress health, and achievement logic
- **extension-notifications** — blueprint for the extension-side notification engine: stage scheduling, alarm-based firing, percentage milestones, and popup sync

> Skills are development-time blueprints for Claude Code — not runtime callables. Each skill defines the spec; the TypeScript implementation lives in `hooks/`, `lib/`, `components/`, and `extension/`.

---

<!-- slide 5 — methodology -->

# Methodology

1. **Read memory** — load `.claude/CLAUDE.md` and memory files for conventions + progress
2. **Research** — reuse memory findings; only query Context7 for truly new primitives
3. **Virtual size** — report new/modified files, estimated lines; split if >200 lines
4. **Skill plan** — write/update skill file only after user approves scope
5. **Ready state** — report skill, agent choice, test plan; wait for "go"
6. **Implement** — spawn agent to write code + tests
7. **Verify** — `npx tsc --noEmit` + `npx vitest run` — both must pass
8. **Update memory** — append one-line status to `progress.md`
9. **Wait for review** — before starting the next piece

Conventional Commits throughout · one commit per piece

---

<!-- slide 6 — trigger -->

# Trigger

Each tool runs automatically at a defined point in the development workflow:

| Tool                                    | When it runs                                                   |
| --------------------------------------- | -------------------------------------------------------------- |
| **projects-timer skill**                | Start of any timer/project feature implementation              |
| **frontend-layout skill**               | Start of any layout/shell/navigation feature                   |
| **core-data-workflow skill**            | Before implementing store slices or data-layer changes         |
| **settings-gamification skill**         | Before implementing gamification or settings pieces            |
| **extension-notifications skill**       | Before implementing extension notification features            |
| **core-architect agent**                | Before every major feature — validates data-model decisions    |
| **extension-engineer agent**            | When implementing extension features                           |
| **ui-designer agent**                   | When implementing UI components                                |
| **notification-copywriter agent**       | When writing notification copy or milestone messages           |

---

<!-- slide 7 — commands -->

# Commands

All skills and agents are invoked via Claude Code as part of the defined workflow.

**Dev workflow**

```bash
npm run dev        # start Next.js dev server
npm test           # run Vitest test suite
npx tsc --noEmit   # type-check without emitting
npx wxt build      # build the browser extension
```

**Extension commands**

```
wxt build       →  .output/chrome-mv3/    (load unpacked)
npm run zip     →  focusflow-extension.zip (GitHub release)
```

**Agent invocation**

```
/agent <name>         fire a subagent by name
Skill(<name>)         invoke a development skill
```

**Pipeline steps (one commit per piece)**

```
piece definition → skill plan → subagent implement → tsc + tests → memory update
```
