# FocusFlow AI — Use-Case Verification Report

**Date:** 2026-06-21
**Environment:** Windows 11, Node.js (via npm), Next.js 16.2.9 (Turbopack), Chrome/Edge via Playwright MCP
**Scope:** Web app flows, extension build/output, integration smoke tests

---

## Executive Summary

FocusFlow AI **does not yet work reliably end-to-end** for its core use case. While the extension builds correctly and unit tests pass, the web app has **critical runtime bugs** that block normal usage:

1. **Zustand store does not rehydrate on client-side navigation** — every route change shows stale/empty state until a hard browser reload.
2. **Dashboard stat cards are hardcoded** — they always display 0 projects and 0 focus time.
3. **Timer reset button does not reset values** — it only pauses the timer.
4. **TimerPanel crashes on refresh** with a React "Rules of Hooks" error (`useTimer` called conditionally).
5. **`/settings` page is missing** (known gap from roadmap).

| Phase | Pass | Fail | Partial / Skip |
|-------|------|------|----------------|
| A — Code Health | 3 | 1 | 0 |
| B — Web App Flows | 4 | 2 | 3 |
| C — Extension Flows | 2 | 0 | 4 (manual) |
| D — Integration | 0 | 1 | 1 (manual) |

---

## Phase A — Code Health

| Step | Command | Result | Notes |
|------|---------|--------|-------|
| A1 | `npx tsc --noEmit` | ✅ PASS | No type errors |
| A2 | `npm run lint` | ❌ FAIL | 31 errors, 67 warnings |
| A3 | `npm test` | ✅ PASS | 166/166 tests passed |
| A4 | `npm run build:ext` | ✅ PASS | `.output/chrome-mv3/` produced |

### Lint failures (skipped per user request)

Key errors included:
- `components/ui/chart.tsx` — conditional React Hook calls (shadcn/ui generated file)
- `extension/lib/{focusSync,redirect,storage,timerAlarm}.ts` — `require()` imports forbidden
- `hooks/useTimer.ts` — mutating `useState()` return value; `tick` accessed before declaration

---

## Phase B — Web App Flows (Playwright MCP)

| Step | Test Case | Result | Notes |
|------|-----------|--------|-------|
| B1 | Dashboard loads | ✅ PASS | Sidebar, stat cards, add-project action render |
| B2 | Create project | ⚠️ PARTIAL | Project saved to `localStorage`, but UI does not reflect it without a hard reload |
| B3 | Add sub-piece | ✅ PASS | Works after hard-reloading `/projects` |
| B4 | Timer page shows active project/sub-piece | ✅ PASS | Project name, sub-piece, elapsed/remaining visible |
| B5 | Timer starts and counts up/down | ✅ PASS | Status "Running"; project elapsed increases; remaining decreases |
| B6 | Timer pauses | ✅ PASS | Status "Paused"; values stop changing |
| B7 | Sub-piece auto-completes | ⏭️ SKIP | Would require 25-minute wait; covered by `useTimer.test.tsx` |
| B8 | Dashboard stats update | ❌ FAIL | Stat cards remain hardcoded at 0 |
| B9 | Settings page | ⚠️ EXPECTED FAIL | 404 — page not implemented |

### Critical web-app bugs found

1. **Store rehydration fails on client-side navigation**
   - After creating a project, `/projects` and `/` still showed empty state.
   - A hard browser reload made `/projects` display the project.
   - This indicates `useFocusStore` + Zustand `persist` is not rehydrating correctly during Next.js App Router client transitions.

2. **Dashboard stats are hardcoded**
   - Even after hard reload, dashboard shows:
     - Total Projects: 0
     - Today's Focus Time: 0 မိနစ်
     - Current Level: 1
   - The stat cards are not wired to the store.

3. **Reset button does not reset**
   - Clicking reset while paused or running only pauses the timer.
   - Project elapsed and sub-piece remaining are not restored to their initial values.

4. **TimerPanel crashes on refresh**
   - Hard-reloading `/timer` after a session produced a React error overlay:
     - `React has detected a change in the order of Hooks called by TimerPanel`
     - Stack: `hooks/useTimer.ts:111` → `components/timer/TimerPanel.tsx:62`
   - Root cause: `useTimer` is called conditionally (or its internal hooks order changes between renders).

---

## Phase C — Extension Flows

| Step | Test Case | Result | Notes |
|------|-----------|--------|-------|
| C1 | Extension loads in browser | ⏭️ MANUAL | Requires loading unpacked `.output/chrome-mv3/` in `chrome://extensions` |
| C2 | Popup empty state | ✅ PASS | Verified static HTML at `http://localhost:3002/popup.html` |
| C3 | Popup shows timer state | ⏭️ MANUAL | Requires loaded extension + active web-app session |
| C4 | Strict mode redirects forbidden URL | ⏭️ MANUAL | Requires loaded extension + strict mode enabled |
| C5 | Warn mode overlay | ⏭️ MANUAL | Requires loaded extension + warn mode + forbidden URL |
| C6 | Blocked page renders | ✅ PASS | Verified static HTML at `http://localhost:3002/blocked.html` |

### Extension build verification

`npm run build:ext` produced a valid Chrome MV3 bundle at `.output/chrome-mv3/`:

- `manifest.json` ✅
  - MV3, name/description/version correct
  - Permissions: `storage`, `tabs`, `alarms`, `notifications`, `scripting`, `declarativeNetRequest`
  - Host permissions: youtube, instagram, tiktok, facebook, twitter, reddit, netflix
  - `externally_connectable`: `http://localhost:3000/*`
  - `web_accessible_resources`: `blocked.html`
  - Background service worker + action popup configured
  - Content scripts: `focusSync.js` (localhost), `warn.js` (forbidden hosts)
- `popup.html` ✅ — Burmese-first labels, status dot, project/sub-piece fields, elapsed/remaining, open-app button
- `blocked.html` ✅ — Burmese/English blocked message, pastel theme
- `background.js`, `content-scripts/focusSync.js`, `content-scripts/warn.js` ✅ present

### Manual extension checklist

To complete C1, C3, C4, C5:

1. Open Chrome/Edge → `chrome://extensions` → enable Developer mode.
2. Click **Load unpacked** → select `d:\vibe_code_tour\kill_the_laziness\.output\chrome-mv3`.
3. Verify extension appears with service worker active.
4. Open popup → should show empty state.
5. Start a timer in `http://localhost:3000/timer`.
6. Wait 5–10 seconds, reopen popup → should show project/sub-piece names, elapsed, remaining, running dot.
7. Open forbidden URL (e.g. `https://www.youtube.com/shorts`):
   - With `strictMode: true` → redirect to `blocked.html`
   - With `strictMode: false` → warn overlay appears

---

## Phase D — Integration Checks

| Step | Test Case | Result | Notes |
|------|-----------|--------|-------|
| D1 | Session persists across page refresh | ❌ FAIL | `/timer` hard-reload crashed with React hooks error |
| D2 | Web app timer syncs to extension popup | ⏭️ MANUAL | Requires loaded extension |

---

## Known Limitations (Non-Blockers)

- `/settings` page does not exist (404).
- Gamification/XP UI, analytics charts, fortress visualization not implemented.
- Extension settings (strict mode, forbidden URLs) require the web-app settings UI or manual storage edits.

---

## Recommendations

### Must fix before any release

1. **Fix Zustand persist rehydration on client-side navigation.**
   - Likely requires adding a hydration guard in the store or wrapping components that read persisted state.
   - Consider `persist` middleware `onRehydrateStorage` or a `hasHydrated` flag.

2. **Fix TimerPanel / useTimer conditional hooks crash.**
   - Ensure all hooks in `useTimer` are called unconditionally.
   - The hook is currently called inside `TimerPanel` only when `activeProject` exists; move the hook call outside the conditional or provide stable default arguments.

3. **Wire dashboard stats to the store.**
   - Replace hardcoded `0` values with `projects.length`, `today's focus time`, and computed level.

4. **Fix timer reset behavior.**
   - Reset should restore project elapsed to 0 (or current total) and sub-piece remaining to its allocated duration.

### Should fix soon

5. **Resolve ESLint errors** (especially the `require()` imports and `useTimer` mutability issues).
6. **Build `/settings` page** so strict/warn mode can be toggled without manual storage edits.

### Verification status

**Overall: ❌ NOT READY for release.**
Core timer logic works in isolation, but the web app cannot reliably display or persist user data across navigation.
