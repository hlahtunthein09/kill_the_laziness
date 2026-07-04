# Master Skill: Settings, Gamification & Advanced Features

## Purpose
Build and maintain the settings page, motivational systems, XP/streak/fortress gamification, daily goals, quick focus, distraction log, backup/restore sync, and scheduled focus sessions.

## Scope
- Settings page shell and settings components
- Notification, sound, strict mode, theme, forbidden URLs toggles
- Daily focus goal tracking and UI
- Streak counter
- XP/fortress computation and dashboard widgets
- Distraction log
- Import/export sync panel
- Scheduled focus sessions
- Motivation message bank and notification copy

## Key Files
- `app/settings/page.tsx`
- `components/settings/NotificationsToggle.tsx`
- `components/settings/SoundToggle.tsx`
- `components/settings/StrictModeToggle.tsx`
- `components/settings/ThemeSelector.tsx`
- `components/settings/AddForbiddenUrl.tsx`
- `components/settings/ForbiddenUrlsList.tsx`
- `components/settings/DailyFocusGoalInput.tsx`
- `components/settings/SyncPanel.tsx`
- `components/analytics/DailyFocusGoal.tsx`
- `components/analytics/StreakCounter.tsx`
- `components/fortress/FortressSvg.tsx`
- `components/distraction/DistractionLog.tsx`
- `components/schedule/ScheduleCard.tsx`
- `components/schedule/ScheduleList.tsx`
- `components/schedule/ScheduleForm.tsx`
- `components/schedule/ScheduleToast.tsx`
- `hooks/useScheduleWatcher.ts`
- `lib/motivation.ts`
- `lib/notifications.ts`
- `lib/sound.ts`
- `lib/sync.ts`
- `lib/store/slices/settingsSlice.ts`
- `lib/store/slices/scheduleSlice.ts`

## Architecture Conventions

### Settings
- Settings live in `AppSettings` type and `settingsSlice`.
- Each setting has its own toggle/input component under `components/settings/`.
- The settings page is a client component that composes these toggles.
- Burmese-first labels with English subtitles.

### Gamification
- XP sources: per-minute focus time + sub-piece completion bonus.
- Fortress level/health derived from total project XP using `LEVEL_THRESHOLDS`.
- Streak logic: compare `lastStreakDate` to yesterday/today; update on daily goal reached.
- Daily focus goal tracked in `settings.todayFocusSeconds` and `settings.dailyFocusGoalMinutes`.

### Motivation
- `lib/motivation.ts` provides tiered Burmese-first messages.
- Tiers: `beginning`, `struggling`, `succeeding`, `completing`.
- `lib/notifications.ts` provides notification templates (session complete, distraction blocked, milestone).

### Distraction Log
- Records blocked/warned attempts with URL and timestamp.
- Displayed on `/settings`.

### Sync (Import/Export)
- `lib/sync.ts` handles serialization/deserialization of store state.
- `SyncPanel` provides download JSON and upload/merge UI.

### Schedules
- `FocusSessionSchedule` type with project/sub-piece, days, start time, duration.
- `scheduleSlice` for CRUD + getters.
- `useScheduleWatcher` checks for due schedules and shows `ScheduleToast`.
- Extension syncs schedules for alarm-based notifications.

## Implementation Checklist

1. Read `.claude/memory/gamification-spec.md`, `.claude/memory/schedule-spec.md`, `.claude/memory/notification-spec.md`, `.claude/memory/store-schema.md`.
2. Add new settings fields to `AppSettings` type, default constants, and slice.
3. Compute gamification values in store selectors/actions, not in UI.
4. Keep motivation messages encouraging, Burmese-first, short.
5. Use the nature palette for fortress and dashboard widgets.

## Testing Strategy
- Component tests for settings toggles (state update on change).
- Store tests for XP/level/streak/goal logic.
- Schedule slice tests for CRUD, getters, and due-schedule detection.
- Distraction log tests for adding/displaying entries.
- Run targeted tests: `npx vitest run components/settings/__tests__ components/analytics/__tests__ components/schedule/__tests__ lib/__tests__`.
- Run `npx tsc --noEmit`.

## Agent Notes
- When adding a new setting, update `AppSettings`, `DEFAULT_APP_SETTINGS`, `settingsSlice`, and the UI toggle.
- When modifying gamification, verify fortress level/health remain consistent across XP changes.
- When adding motivation messages, follow the tone guidelines in `.claude/memory/notification-spec.md`.
- When adding schedules, consider extension sync and alarm wiring.
- Sound playback must respect `settings.soundEnabled`; see `lib/sound.ts`.
- Notification helpers must respect `settings.notificationsEnabled`.
