<!-- ch-5 personal-project report. -->

# ch-5 Personal Project — Report

## Project

- **GitHub username:** @hlahtunthein09
- **Repo URL:** https://github.com/hlahtunthein09/kill_the_laziness
- **Live / download URL:** https://kill-the-laziness.vercel.app
- **Extension download:** https://github.com/hlahtunthein09/kill_the_laziness/releases/tag/v0.1.0

## AI Tools Used

- **Context7 MCP** — queried up-to-date documentation for Next.js 16, shadcn/ui, Zustand 5, WXT, and webextension-polyfill during development
- **projects-timer skill** — blueprint for project/sub-piece CRUD, the `useTimer` hook with drift correction, timer UI panel, and completion/refocus flows
- **frontend-layout skill** — blueprint for the app shell, sidebar, header, responsive grid, and navigation structure with shadcn/ui primitives
- **core-data-workflow skill** — blueprint for Zustand store slices, domain types, constants, and the data-persistence layer
- **settings-gamification skill** — blueprint for the settings panel, XP/level system, fortress health, achievement logic, and daily goals
- **extension-notifications skill** — blueprint for the extension-side notification engine, stage scheduling, alarm-based firing, percentage milestones, and popup sync
- **core-architect agent** — validated data-model decisions, store slices, and cross-layer dependencies before each major feature
- **extension-engineer agent** — built the Manifest V3 browser extension: service worker, content scripts, popup UI, and off-screen notification engine
- **ui-designer agent** — implemented UI components following the pastel nature theme with hydration safety and Burmese-first labels
- **notification-copywriter agent** — generated motivational notification copy for the percentage-based milestone system in Burmese + English

### Skill (required)

- **path:** `.claude/skills/projects-timer/SKILL.md`
- **what:** Blueprint for all timer and project features — defines the `useTimer` hook contract (requestAnimationFrame + Date.now() delta for accuracy, drift recovery on tab restore, auto-pause on completion), project/sub-piece CRUD flow, completion dialog states, and refocus resets. Used as the spec each time a new timer or project piece begins.

### Subagent (required)

- **path:** `.claude/agents/extension-engineer.md`
- **what:** Built the WXT Manifest V3 browser extension end-to-end — implements the background service worker for tab monitoring, content scripts for distraction overlays, popup UI for timer state display, and off-screen notification engine with percentage-based milestone alarms. Runs whenever an extension feature piece is being implemented.

- **path:** `.claude/agents/core-architect.md`
- **what:** Reviews and validates architecture decisions before each major feature — checks data-model consistency, store slice boundaries, timer-engine invariants, and sync protocol correctness. Ensures cross-layer dependencies are clean before implementation starts.

## Trigger / Command

- **Trigger:**
  - All 5 skills run automatically at the start of a feature piece that matches their scope, referenced as blueprints in the workflow rules in `CLAUDE.md`
  - `core-architect` agent fires before every major feature to validate architecture decisions
  - `extension-engineer` agent fires when implementing extension features (notifications, popup, anti-distraction)
  - `ui-designer` agent fires when implementing UI components
  - `notification-copywriter` agent fires when writing notification messages

- **Command:** No slash commands — all skills and agents are invoked by Claude Code as part of the 9-step development workflow. Agents are spawned with exact commands:

  ```
  Agent({ subagent_type: "core-architect", prompt: "Review data model and store slices for this feature", model: "sonnet" })
  Agent({ subagent_type: "extension-engineer", prompt: "Build the extension feature for [piece description]", model: "sonnet" })
  Agent({ subagent_type: "ui-designer", prompt: "Implement UI components for [piece description]", model: "sonnet" })
  Agent({ subagent_type: "notification-copywriter", prompt: "Write notification copy for [milestone/event]", model: "haiku" })
  ```

## Tech-Stack Slides

- **Slides path:** slides/tech-stack.md

## User Feedback (pick ONE — use just one template)

- **Feedback file path:** feedback/feedback.md
