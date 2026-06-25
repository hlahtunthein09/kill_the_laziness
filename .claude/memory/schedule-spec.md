# Scheduled Focus Sessions — Design Spec

## Goal
Let users create recurring focus schedules (e.g. "Mon-Fri 09:00, Project X, 25 min") and get notified when a session is due.

## Data Model

```ts
export interface FocusSessionSchedule {
  id: string;
  projectId: string;
  subPieceId?: string;     // optional; if omitted, uses project's first incomplete sub-piece
  dayOfWeek: number;       // 0 (Sun) - 6 (Sat)
  startTime: string;       // "HH:mm" (24-hour)
  durationMinutes: number; // e.g. 25
  enabled: boolean;
  createdAt: number;
}
```

## Store Actions (ScheduleSlice)

- `addSchedule(input)` — create enabled schedule, return it
- `updateSchedule(id, updates)` — partial edit
- `deleteSchedule(id)` — remove
- `toggleSchedule(id)` — flip `enabled`
- `getSchedulesForDay(dayOfWeek)` — filter by day
- `getNextDueSchedule()` — earliest enabled schedule from now today (or next matching day)

## UI Plan

- `ScheduleCard` — one row: project/sub-piece, day/time, duration, toggle, delete
- `ScheduleList` — list of cards with empty state
- `ScheduleForm` — dialog add/edit form (project select, sub-piece select, day, time, duration)
- Settings page section hosts `ScheduleList` + `ScheduleForm`

## Timer Integration

- `useScheduleWatcher` hook polls every 60 s and returns a `dueSchedule` when current day+time matches an enabled schedule (dedup per minute).
- `ScheduleToast` shows a Burmese-first toast with a "Start now" action.
- `TimerPanel` renders the watcher/toast so the user is notified anywhere in the app.

## Extension Integration (later sub-pieces)

- `focusSync.ts` forwards schedules to extension storage.
- Background `schedule-check` alarm every minute triggers a desktop notification when due.
- Notification click opens `http://localhost:3000/timer`.

## Constraints

- Each sub-piece ≤ ~70 implementation lines.
- Tests for every store/component/hook piece.
- No auto-start timer without explicit user action (notify first).
