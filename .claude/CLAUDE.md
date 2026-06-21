# Kill The Laziness / FocusFlow AI — Project Context

This file is loaded automatically by Claude Code. It contains project conventions and context for the FocusFlow AI productivity app.

> **Source of truth:** This `.claude/CLAUDE.md` file plus `.claude/memory/` are the canonical project instructions. Root `CLAUDE.md` and `AGENTS.md` are intentionally removed; do not recreate them.

## ⚠️ Framework Note

This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## 🤖 Agent Workflow Rules (Non-Negotiable)

For **every piece** — main or sub-piece — follow this exact order:

1. **Read memory first.** Start with `.claude/CLAUDE.md`, `.claude/memory/conventions.md`, `.claude/memory/progress.md`, and `.claude/memory/workflow.md`.
2. **Research.** Reuse findings from memory. Only query Context7/WebFetch when a **new primitive or pattern** is needed. No broad Context7 dumps for repeated patterns.
3. **Virtual sizing.** Report in one table: new files, modified files, estimated lines, verdict. Split if >3 new files, >1 page, >1 hook, or >200 lines.
4. **Skill.** After user confirms the scope, write/update the skill file in `.claude/skills/`. Do not paste the full skill content in chat.
5. **Report ready state.** One concise message: skill created, agent choice, test plan. Wait for explicit user confirmation before spawning an agent.
6. **Spawn agent + implement + write tests.** Every piece must have tests.
7. **Verify.** Run `npx tsc --noEmit` and the relevant test command (`npx vitest run <test-file>` or `npm test`).
8. **Update memory.** Append a one-line status to `.claude/memory/progress.md` (and `conventions.md` only if conventions change).
9. **Wait for user review** before starting the next piece.

### Never
- Never assume a step is done.
- Never implement without explicit user confirmation.
- Never skip tests.
- Never write a skill file before the user approves the skill plan.
- Never do broad Context7 queries when memory already covers the pattern.
- Never re-read the same source files across turns; check memory first.

### Token-Saving Rules
- Keep chat responses short. Use bullets and short sentences.
- Burmese-first is for UI labels; chat explanations should be concise and minimize unnecessary English repetition.
- Ask only one confirmation question per turn.
- Summarize research in memory files, then reference them in chat instead of repeating details.

## Project Overview

FocusFlow AI is a gamified productivity ecosystem built to eliminate developer procrastination and screen distraction. It combines a Next.js dashboard with a future browser extension for anti-distraction enforcement and off-screen notifications.

## Tech Stack

- **Framework**: Next.js 16 App Router, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Animation**: Framer Motion, canvas-confetti
- **State**: Zustand 5 (with persist middleware)
- **Charts**: Recharts (via shadcn/ui charts)
- **Icons**: Lucide React
- **Extension**: WXT (Manifest V3), webextension-polyfill
- **Package Manager**: npm

## Directory Structure

```
kill_the_laziness/
├── app/                     # Next.js pages
├── components/              # UI components
│   ├── ui/                  # shadcn/ui primitives
│   ├── layout/              # AppShell, Sidebar, Header
│   ├── projects/            # Project/sub-piece UI
│   ├── timer/               # Timer components
│   ├── fortress/            # Dev-Fortress gamification
│   ├── distraction/         # Anti-distraction UI
│   └── analytics/           # Charts and stats
├── lib/                     # Utilities, types, stores
│   ├── types/               # Domain types
│   └── store/               # Zustand stores
├── hooks/                   # Custom React hooks
├── extension/               # Browser extension
└── .claude/                 # Claude context
    ├── CLAUDE.md            # This file
    ├── references.md        # External references
    └── memory/              # Project memory
```

## Coding Conventions

1. **Client components for state/timer/localStorage**: use `"use client"` whenever reading from `localStorage`, using React hooks, or interacting with browser APIs.
2. **Hydration safety**: initialize state lazily in `useState` callbacks; use `suppressHydrationWarning` where appropriate.
3. **Storage keys**: prefix all keys with `ff_` (e.g., `ff_projects`, `ff_active_session`).
4. **Class merging**: use `cn()` from `lib/utils.ts` for conditional Tailwind classes.
5. **Time values**: store all durations in **seconds** internally; format only at display time.
6. **Component naming**: PascalCase for components, camelCase for hooks and utilities.
7. **Types**: keep domain types in `lib/types/`; export from `lib/types/index.ts`.

## Data Model

See `lib/types/index.ts` for canonical types. Key entities:

- `Project` — macro goal with cumulative time and target time
- `SubPiece` — allocated countdown task under a project
- `AntiDistractionLog` — record of blocked/warned distraction attempts
- `AppSettings` — forbidden URLs, strict mode, notifications, theme

## Timer Rules

- Project timer counts up from tracked total.
- Sub-piece timer counts down from allocated minutes.
- Use `requestAnimationFrame` with `Date.now()` delta for accuracy.
- Persist state every 5 seconds to avoid storage thrashing.
- On restore after tab close, calculate drift from `savedAt` timestamp.
- When a sub-piece reaches zero, auto-pause and mark complete.

## Theme

Pastel nature palette:

| Role | Tailwind Class | Hex |
|------|---------------|-----|
| Background | `bg-teal-50` | `#f0fdfa` |
| Primary (Mint) | `bg-teal-500` | `#14b8a6` |
| Secondary (Ocean) | `bg-sky-500` | `#0ea5e9` |
| Accent (Sand) | `bg-amber-200` | `#fde68a` |
| Success (Forest) | `bg-emerald-400` | `#34d399` |
| Text Primary | `text-stone-900` | `#1c1917` |
| Text Secondary | `text-stone-500` | `#78716c` |

## Anti-Distraction

Default forbidden URL fragments:

- `youtube.com/shorts`
- `instagram.com/reels`
- `tiktok.com`
- `facebook.com/reels`
- `twitter.com`
- `reddit.com`
- `netflix.com`

Behavior:

- **Strict mode**: redirect to `extension/blocked.html`.
- **Warn mode**: inject a calming overlay via content script.
- Always log the attempt and notify the user.

## References

See `.claude/references.md` for Context7 library IDs, similar apps, GitHub examples, tutorials, and code snippets.

## Memory Files

Convention memory files live in `.claude/memory/`:

- `store-schema.md` — Zustand store shapes and actions
- `sync-protocol.md` — Web app ↔ extension sync protocol
- `timer-behavior.md` — Timer modes and edge cases
- `ui-conventions.md` — Component patterns and theme usage
- `gamification-spec.md` — XP sources, levels, achievements
- `fortress-svg-spec.md` — Fortress SVG component specs
- `analytics-queries.md` — Data aggregation patterns
- `extension-architecture.md` — Extension file structure and messaging
