# FocusFlow AI (Kill The Laziness) — Proposal by @hlahtunthein09

## Gist
A gamified focus timer and anti-distraction dashboard that helps developers stay on task by tracking projects, timing sub-tasks, and blocking distracting websites.

## Story
Meet a developer who opens YouTube "just for one Short" and loses 45 minutes. They have a deadline, a project to ship, but their attention keeps leaking into infinite feeds. FocusFlow AI is their digital accountability partner: they create a project, break it into timed sub-pieces, and the browser extension redirects or warns them the moment they drift to forbidden sites—turning willpower into a system.

## Why
Context switching and short-form content destroy deep work. FocusFlow AI removes the daily willpower battle by making focus the default: it blocks distractions, logs every attempt, and gamifies progress so developers finish projects instead of feeding algorithms.

## Why Not
- Not a full project management suite (no Gantt charts, no team collaboration, no resource allocation).
- Not a universal AI-based content blocker (only blocks configured URL fragments, not dynamic content classification).
- Not a mobile app (desktop browser extension + responsive web dashboard only).

## Tech Spec
- **Frontend:** Next.js 16 App Router, React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, shadcn/ui components, pastel nature theme
- **State & Animation:** Zustand 5 with persist middleware, Framer Motion, canvas-confetti
- **Analytics:** Recharts for progress charts and distraction logs
- **Extension:** WXT (Manifest V3), webextension-polyfill, content scripts for overlays, background service worker for tab monitoring
- **Timer:** `requestAnimationFrame` with `Date.now()` delta, localStorage persistence every 5s, drift recovery on restore

## Definition of Done
- [ ] User can create projects and allocate countdown sub-piece timers
- [ ] Project timer counts up from total tracked time; sub-piece timer counts down and auto-pauses at zero
- [ ] Extension detects configured forbidden URLs and either redirects (strict mode) or injects a warn overlay
- [ ] Every distraction attempt is logged with timestamp and URL fragment
- [ ] Dashboard displays project progress, sub-piece status, and analytics charts
- [ ] All TypeScript compiles (`npx tsc --noEmit`) and relevant tests pass (`npx vitest run`)
