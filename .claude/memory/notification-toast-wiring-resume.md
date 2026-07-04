---
name: notification-toast-wiring-resume
description: Resume point for wiring web-app milestone toasts to native browser notifications.
metadata:
  type: project
---

**Planned but not implemented (2026-07-04).**

## Context

The extension already fires native milestone notifications via `extension/lib/notifications.ts`. The web-app milestone "speech toasts" (`components/timer/TimerToast.tsx`) currently only show `sonner` in-page toasts. User wants the same notification behavior applied to those toasts.

Milestone interval is currently 60 seconds (`MILESTONE_INTERVAL_SECONDS = 60` in `lib/constants.ts`) for testing.

## Scope agreed

Small, single piece:

1. Add a web-safe `showWebNotification()` helper in `lib/notifications.ts` that uses the standard browser `Notification` API.
2. In `components/timer/TimerToast.tsx`, on every `trigger === "milestone"`, also call the helper when `settings.notificationsEnabled` is true.
   - Use `milestoneNotification(minutes)` from `lib/notifications.ts` for title/body.
3. In `components/settings/NotificationsToggle.tsx`, request `Notification.permission` when the user turns notifications on.
4. Update tests:
   - `components/timer/__tests__/TimerToast.test.tsx` — assert native notification is created on milestone when enabled.
   - `components/settings/__tests__/NotificationsToggle.test.tsx` — assert permission request on toggle.

## Files involved

- `lib/notifications.ts` — add `showWebNotification()` helper.
- `components/timer/TimerToast.tsx` — call helper on milestone.
- `components/settings/NotificationsToggle.tsx` — request permission on enable.
- Tests: `TimerToast.test.tsx`, `NotificationsToggle.test.tsx`.

## Known risks

- If the extension is also installed, the user may receive duplicate milestone notifications (one from web app, one from extension). Consider a single-source preference later.
- Web notifications require a user gesture for permission request; must be requested from the toggle, not from the timer.

## Verification plan

- `npx tsc --noEmit`
- `npx vitest run components/timer/__tests__/TimerToast.test.tsx components/settings/__tests__/NotificationsToggle.test.tsx`
- Live browser test: start timer, enable notifications, wait for 60s milestone, confirm native banner appears.
