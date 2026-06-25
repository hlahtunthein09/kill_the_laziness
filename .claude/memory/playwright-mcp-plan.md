# Playwright MCP Lightweight Feature Test Plan — Refined

## Goal
Verify FocusFlow AI features + UI/UX in a real browser using Playwright MCP, one tiny test at a time, with strict workload limits to avoid PC crashes.

## Constraints (Non-Negotiable)

1. **One test at a time** — run one tiny test, report result, wait for user confirmation before next.
2. **Time budget per test ≤ 90 seconds** — if a test takes longer, abort and report.
3. **Headless only** — `PLAYWRIGHT_MCP_HEADLESS=true`.
4. **No screenshots** — use `browser_snapshot` and `browser_evaluate` only.
5. **No vision capability** — never add `--caps=vision`.
6. **Close browser context after each test** — keep server running, but free memory.
7. **Max 3 assertions per test** — fewer is better.
8. **Stop immediately on crash/slowness** — user will resume later.

## MCP Server Config

```bash
PLAYWRIGHT_MCP_HEADLESS=true \
PLAYWRIGHT_MCP_BROWSER=chrome \
PLAYWRIGHT_MCP_VIEWPORT_SIZE=1280x720 \
npx @playwright/mcp@latest --caps=testing,storage
```

Optional second viewport run for responsive check: `PLAYWRIGHT_MCP_VIEWPORT_SIZE=390x844`.

## What We Check Per Test

Beyond "does it work", each test also checks **UI/UX signals**:

- **Layout / ratio:** element visible, not overflowing, expected order (snapshot text order).
- **Responsive pattern:** same element visible at mobile width (only if marked responsive).
- **Theme:** `html` class or `data-theme` value; light/dark background color classes present.
- **Font / color:** Burmese text renders without tofu; primary color class (`text-teal-500`, `bg-teal-500`) present.
- **UX:** buttons have labels; empty states shown; errors prevented; navigation feedback.
- **Glitches:** console errors, broken text, overlapping elements, missing icons.

## Tiny Test Catalog

### Feature: Projects

| # | Test | Steps | UI/UX Checks |
|---|---|---|---|
| P1 | Open projects page | Navigate `/projects` | Header Burmese visible; page has padding; no console error |
| P2 | Add project dialog | Click add → dialog opens | Dialog centered; form labels Burmese+English; primary button teal |
| P3 | Create project | Fill name/target → submit | New card appears; project name visible; card has border/shadow |
| P4 | Empty state | Clear store → `/projects` | Empty message Burmese visible; CTA button visible |
| P5 | Focus project | Seed project → click focus | Navigates to `/timer`; project name shown; active badge/ring visible |

### Feature: Sub-pieces

| # | Test | Steps | UI/UX Checks |
|---|---|---|---|
| SP1 | Default sub-piece created | Focus empty project | `/timer` shows default sub-piece name "အထွေထွေ focus (General Focus)" |
| SP2 | Add sub-piece | `/projects` → project add sub-piece | Sub-piece appears in project card |

### Feature: Timer

| # | Test | Steps | UI/UX Checks |
|---|---|---|---|
| T1 | Timer page loads | Seed project+sub → `/timer` | Project + sub-piece names visible; timer display visible |
| T2 | Start timer | Click Start | Button swaps to Pause; elapsed time increments after 1s |
| T3 | Pause timer | Start → Pause | Button swaps to Start; elapsed time stops |
| T4 | Reset timer | Start → Reset | Time returns to initial value |
| T5 | Session summary | Let sub-piece complete | Summary card visible; XP text visible; Continue button visible |

### Feature: Dashboard

| # | Test | Steps | UI/UX Checks |
|---|---|---|---|
| D1 | Daily focus goal | `/` | Card title Burmese; progress bar visible; teal fill |
| D2 | Streak counter | `/` | Flame icon; streak number visible; subtitle English |
| D3 | Fortress card | Seed project → `/` | Fortress SVG visible; level/health text visible |
| D4 | Quick focus | `/` | Input + start button visible; Burmese placeholder |

### Feature: Settings

| # | Test | Steps | UI/UX Checks |
|---|---|---|---|
| S1 | Settings page loads | `/settings` | All section titles Burmese+English visible; cards stacked |
| S2 | Strict mode toggle | `/settings` → click toggle | Toggle moves; label unchanged |
| S3 | Sound toggle | `/settings` → click toggle | Toggle moves |
| S4 | Theme selector | `/settings` → select light/dark | `html` class changes; no flash |
| S5 | Daily goal input | `/settings` → edit goal | Input accepts number; confirm button appears |
| S6 | Forbidden URL add | `/settings` → add URL | URL appears in list; delete button visible |
| S7 | Distraction log | `/settings` → scroll | Log section title visible; empty or entries visible |
| S8 | Sync panel | `/settings` | Download/Restore buttons visible |
| S9 | Scheduled focus section | `/settings` | Section title visible; Add Schedule button visible; list area visible |
| S10 | Add schedule | `/settings` → open form → fill → save | Schedule card appears; day/time/duration visible; toggle on |
| S11 | Edit schedule | `/settings` → click edit pencil | Edit dialog opens pre-filled; Update button visible |
| S12 | Delete schedule | `/settings` → delete schedule | Card removed; empty state appears |

### Feature: Extension

| # | Test | Steps | UI/UX Checks |
|---|---|---|---|
| E1 | Extension popup loads | Build ext → open popup HTML | Title visible; status dot/text visible; Open App button visible |
| E2 | Popup start button | Popup shows paused state → click Start | Start message or forwarded state |

## Issue Log Format

For each test, record:

```
Test: <code>
Status: PASS / FAIL / PARTIAL
Notes:
- <what worked>
- <any glitch, layout issue, color/theme problem, console error>
Screenshot: NO (never)
```

## Execution Flow

1. Start dev server: `npm run dev` on `localhost:3000`.
2. Start MCP server with the lightweight config.
3. Pick test by code (e.g. "P1").
4. Run exactly the listed steps.
5. Record result in issue log format.
6. Close browser context.
7. Wait for user confirmation for next test.

## Safety Rules

- If MCP server fails to start, stop and report.
- If any single test exceeds 90 s, abort and report timeout.
- If browser memory spikes, close context immediately.
- Do not run multiple tests in one prompt.
- Do not capture screenshots or enable vision.

## Decision Pending

Order of tests. Suggested order: P1 → P2 → P3 → P4 → P5 → SP1 → SP2 → T1 → T2 → T3 → T4 → T5 → D1 → D2 → D3 → D4 → S1 → S2 ... E1 → E2.

User can reorder or skip tests.
