---
name: verification-issues-2026-06-25
description: Issues and observations collected during Playwright MCP verification session on 2026-06-25.
metadata:
  type: project
---

# Playwright MCP Verification Issues — 2026-06-25

Session goal: run 30 tiny headless browser verification tests for FocusFlow AI web app + extension.
Rule: log every observation/issue without sizing; user will review and decide what to fix.
**Execution note updated 2026-06-25:** Reuse single browser context across tests; reset state via localStorage + refresh. Do not close/reopen browser per test (caused PC crash).
**PC crash note:** PC has crashed TWICE during this verification session. Keep load minimal — prefer evaluate() checks over full snapshots, no screenshots/vision, persist progress to memory after every test.

## Status Overview

| Code | Test | Status |
|---|---|---|
| P1 | Open projects page | ✅ PASS |
| P2 | Add project dialog | ✅ PASS |
| P3 | Create project | ✅ PASS |
| P4 | Empty state | ✅ RESOLVED (expected behavior) |
| P5 | Focus project | ✅ PASS |
| SP1 | Default sub-piece | ✅ PASS |
| SP2 | Add sub-piece | ✅ PASS |
| T1 | Load timer | ✅ PASS |
| T2 | Start timer | ✅ PASS |
| T3 | Pause timer | ✅ PASS |
| T4 | Reset timer | ✅ PASS |
| T5 | Session summary | ❌ FAIL |
| D1 | Daily goal | ✅ PASS |
| D2 | Streak | ✅ PASS |
| D3 | Fortress | ✅ PASS |
| D4 | Quick focus | ✅ PASS |
| S1 | Settings page loads | ⚠️ PARTIAL |
| S2 | Strict mode toggle | ✅ PASS |
| S3 | Notifications toggle | ✅ PASS |
| S4 | Sound toggle | ✅ PASS |
| S5 | Theme selector | ⚠️ PASS (logic) / UI broken in dark+system |
| S6 | Daily focus goal input | ✅ PASS |
| S7 | Add forbidden URL | ✅ PASS |
| S8 | Forbidden URLs list | ✅ PASS |
| S9 | Distraction log | ✅ PASS |
| S10 | Sync export | ✅ PASS |
| S11 | Sync import | ✅ PASS |
| S12 | Schedule add/edit/delete | ✅ PASS (Issue #8 reconfirmed) |

## Issue / Observation Log

### 1. P4 — Empty state (RESOLVED: expected behavior, not a bug)
- **Found during:** P4 verification
- **Status:** ✅ RESOLVED — working as designed, no fix needed.
- **Investigation (user, live):** Cleared localStorage → reloaded `/projects` → project-level empty state did NOT appear. Instead the default project `"နေ့စဥ် Focus နေရာ (Daily Focus)"` was auto-created, sub-piece empty state shown (`အခန်းကဏ္ဍများ မရှိသေးပါ`), Add-project button visible, no console errors.
- **Root cause:** `components/providers/StoreHydrationProvider.tsx:17` auto-creates the default project after hydration when `projects.length === 0` (Tier 1 Piece 3, intentional). The `ProjectList` empty state is therefore effectively unreachable in normal use.
- **Decision:** P4 "project empty state" is not a meaningful live test. Repurpose/retire it; the reachable empty state is the **sub-piece** one, which already renders correctly.
- **Related files:** `components/providers/StoreHydrationProvider.tsx`, `components/projects/ProjectList.tsx`

### 2. Dashboard greeting renders on `/projects` page
- **Found during:** SP2 verification
- **Severity:** observation / possible layout issue
- **Description:** When navigating to `/projects`, the dashboard greeting header ("မင်္ဂလာပါ၊ ဒီနေ့လည်း focus လုပ်ကြမယ်" / "Ready to build your fortress?") renders at the top of the page above the projects list.
- **Question:** Is this intentional cross-page header, or should the greeting be dashboard-only?
- **Related files:** `components/layout/Header.tsx` or `app/page.tsx`, `app/projects/page.tsx`

### 3. Timer controls — Start/Pause/Reset labels all in DOM text
- **Found during:** T2 verification
- **Severity:** observation / possible UX issue
- **Description:** After clicking Start, the page `innerText` still contains "စတင် (Start)", "ခဏရပ် (Pause)", and "ပြန်စ (Reset)" simultaneously. It is unclear whether the inactive button is hidden via CSS/data attribute or whether both buttons remain visible.
- **Question:** Do the buttons actually toggle visibility, or are all three always rendered?
- **Related files:** `components/timer/TimerControls.tsx`

### 4. Active session persists across page loads / test runs
- **Found during:** T3 verification
- **Severity:** observation / possible test-isolation or product issue
- **Description:** When loading `/timer` with a seeded active project, the Start button was disabled because `ff_active_session` already existed and `isRunning` was `true`. The timer had auto-resumed from a previous session even after `localStorage.removeItem('ff_active_session')` was called in an earlier step.
- **Question:** Is `ff_active_session` persistence across reloads the intended behavior, or should a fresh page load without an explicit active session start in a paused/idle state?
- **Related files:** `hooks/useTimer.ts`, `lib/store/slices/projectSlice.ts`
- **Impact:** Makes timer tests harder to isolate; may surprise users who return to the app after closing the tab.

### 5. T4 — Reset timer behavior ambiguity
- **Found during:** T4 verification
- **Severity:** observation / possible behavior-clarification issue
- **Description:** After starting the timer and letting it run, clicking Reset paused the timer and cleared `ff_active_session`, but the store's `totalTimeSeconds` and `subPiece.elapsedSeconds` retained the accumulated seconds (e.g., 120s → 145s). The display showed the updated store values (2m 25s / 22m 35s), not the pre-run values.
- **Question:** Does "Reset" mean "reset the current session to the current store state" (keeps accumulated time) or "restore original pre-run values" (undo session time)? Current behavior keeps accumulated time.
- **Related files:** `hooks/useTimer.ts`, `lib/store/slices/projectSlice.ts`
- **Note:** Earlier memory claimed reset restores values to store values and pauses; current behavior appears to keep accumulated store time. Needs clarification.

### 6. T5 — Session summary does not render after sub-piece completion
- **Found during:** T5 verification
- **Severity:** bug (user to review)
- **Description:** When a sub-piece reaches completion, the store updates correctly (subPiece status becomes "completed", project status becomes "completed", XP is added, fortress health changes). However, the `SessionSummary` card does not appear on `/timer`. Instead, `TimerPanel` falls back to the empty state "အခန်းကဏ္ဍများ မရှိသေးပါ / No sub-pieces to focus on".
- **Reproduction:** Seed active sub-piece with `allocatedMinutes: 1`, `elapsedSeconds: 58`, `status: "running"`, set `ff_active_session` with `subPieceRemaining: 2` and `isRunning: true`, then load `/timer` and wait for completion.
- **Expected:** `SessionSummary` card visible with project/sub-piece names, focused duration, XP gained, motivation message, and "ဆက်လက်ပါ (Continue)" button.
- **Actual:** Empty state rendered.
- **Related files:** `components/timer/TimerPanel.tsx`, `components/timer/SessionSummary.tsx`, `hooks/useTimer.ts`

### 7. D1 — Daily goal shows "Goal reached" at 50% progress
- **Found during:** D1 verification
- **Severity:** observation / UI wording bug
- **Description:** `DailyFocusGoal` card displays "50% achieved (Goal reached)" when the user has completed 30 of 60 minutes. The "Goal reached" label appears before the goal is actually met.
- **Expected:** "Goal reached" should appear only when `todayFocusSeconds / (dailyFocusGoalMinutes * 60) >= 1`.
- **Related files:** `components/analytics/DailyFocusGoal.tsx`

### 8. S1 — Nested `<button>` in ScheduleForm (hydration error)
- **Found during:** S1 verification (`/settings`)
- **Severity:** bug (causes React hydration error; 2 console errors)
- **Description:** The "Add Schedule" `DialogTrigger` in `ScheduleForm` renders its own `<button>`, and the shadcn `Button` placed inside it renders a second `<button>` → `<button>` nested inside `<button>`. Browser console logs: "In HTML, <button> cannot be a descendant of <button>. This will cause a hydration error." Snapshot confirms nested buttons (outer "Add Schedule" button contains inner "Add Schedule" button).
- **Expected:** Single button element for the dialog trigger; 0 console errors on `/settings`.
- **Fix:** Add `asChild` to the `DialogTrigger` so it forwards props to the child `Button` instead of rendering its own `<button>` (same pattern other dialogs use).
- **Related files:** `components/schedule/ScheduleForm.tsx`

### 9. D2 — Streak label spelling typo
- **Found during:** D2 verification
- **Severity:** minor (spelling only)
- **Description:** Streak card label reads "အစဉ်လိုက်က် focus ရက်များ (Streak)" — "လိုက်က်" has a doubled "က်".
- **Expected:** "အစဉ်လိုက် focus ရက်များ".
- **Related files:** `components/analytics/StreakCounter.tsx`

### 10. S5 — Dark/System theme styling broken (UI)
- **Found during:** S5 verification (user manually confirmed)
- **Severity:** UI bug (functional logic OK)
- **Description:** Theme selector works correctly — store `settings.theme` updates and `next-themes` applies the `dark` class to `<html>`. However, only the **light** theme is styled correctly. In **dark** (and **system** when it resolves to dark), the UI is visually broken/misaligned — many elements don't have proper dark-mode color variants.
- **Expected:** dark theme renders with correct, consistent colors and layout matching the pastel design.
- **Plan:** UI will be reworked later after full manual testing pass; not fixing now.
- **Related files:** global styles / Tailwind dark variants, all components using fixed `bg-*`/`text-*` without dark counterparts.

### 11. Forbidden URL blocking never verified live in a real browser (coverage gap)
- **Found during:** S7/S8 discussion (user raised it)
- **Severity:** verification gap (not a known bug)
- **Description:** The web app only *stores* `settings.forbiddenUrls`. The actual blocking/redirect/warn-overlay enforcement lives in the extension (`extension/lib/urlChecker.ts`, `extension/lib/redirect.ts`, `extension/entrypoints/warn.content.ts`). These are covered only by unit tests using `@webext-core/fake-browser` (mocked APIs): 7 urlChecker + 11 redirect + 6 warnOverlay. There is NO live verification that loading the built extension into a real Chrome and visiting a forbidden URL (e.g. reddit.com) actually triggers the strict-mode redirect to `blocked.html` or the warn-mode overlay.
- **Why not covered:** Playwright MCP drives its own Chrome without the unpacked WXT extension loaded. The 30-test catalog's E1/E2 only check popup load + Start button, not real blocking.
- **Plan / how to verify:** launch Chrome with `--load-extension=.output/chrome-mv3` (after `npm run build:ext`), navigate to a forbidden URL with strict mode on → expect redirect to blocked page; with warn mode → expect overlay. Add as a dedicated extension test after the web catalog.
- **Related files:** `extension/lib/redirect.ts`, `extension/lib/urlChecker.ts`, `extension/entrypoints/warn.content.ts`, `extension/entrypoints/blocked.html`.

## Notes for Follow-up

- Fill in exact P4 reproduction steps.
- Verify button visibility toggle with snapshot/CSS inspection.
- Decide whether active-session auto-resume is a feature or a bug.
- Review dashboard greeting scope.
