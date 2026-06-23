# Skill: Tier 1 Piece 2b — Background Milestone Notifications

## Goal
Send desktop notifications with motivational messages while the focus timer is running, so users get encouragement even when the browser is minimized.

## Files to Read
1. `extension/lib/timerAlarm.ts`
2. `extension/lib/storage.ts`
3. `extension/lib/__tests__/timerAlarm.test.ts`
4. `extension/lib/motivation.ts` (from Piece 2a)
5. `lib/notifications.ts` (for existing notification style)

## Files to Create
None.

## Files to Modify
1. `extension/lib/storage.ts` — add helper to track last sent milestone.
2. `extension/lib/timerAlarm.ts` — send milestone notifications during `onAlarmTick`.
3. `extension/lib/__tests__/timerAlarm.test.ts` — add tests for milestone notifications.

## Implementation Details
- Add `MILESTONE_KEY = "ff_extension_last_milestone"` to `storage.ts`.
- Add helpers:
  - `getLastMilestone(): Promise<number | null>`
  - `setLastMilestone(milestone: number): Promise<void>`
  - `clearLastMilestone(): Promise<void>`
- In `onAlarmTick`:
  - After calculating `updatedProjectElapsed`, compute `currentMilestone = Math.floor(updatedProjectElapsed / 300)`.
  - If `updatedSubPieceRemaining <= 0`, skip milestone logic (complete notification will fire).
  - Read `lastMilestone` from storage.
  - If `currentMilestone >= 1` and `currentMilestone > lastMilestone`:
    - Call `getMotivation({ elapsedSeconds: updatedProjectElapsed, remainingSeconds: updatedSubPieceRemaining, isRunning: true, completedToday: 0 })`.
    - Create notification with:
      - `id`: `"focus-milestone"`
      - `type`: `"basic"`
      - `iconUrl`: `"/icon/128.png"`
      - `title`: `"FocusFlow AI — ရှေ့ဆက်နေတယ်"` (or use `motivation.my` as title)
      - `message`: `${motivation.my} (${motivation.en})`
    - Call `setLastMilestone(currentMilestone)`.
  - When the sub-piece completes and `updatedIsRunning` becomes `false`, call `clearLastMilestone()` so the next session starts fresh.

## Test Strategy
- Mock `browser.notifications.create` via fakeBrowser.
- Test 1: running for >5 min sends a milestone notification and updates lastMilestone.
- Test 2: milestone notification is not sent twice for the same milestone.
- Test 3: no milestone notification for elapsed < 5 min.
- Test 4: complete notification still works and clears lastMilestone.

Run:
1. `npx vitest run extension/lib/__tests__/timerAlarm.test.ts`
2. `npx tsc --noEmit`
3. `npm run build:ext`

## Verification Checklist
- [ ] Milestone notification fires every 5 minutes of elapsed time
- [ ] No duplicate notifications for the same milestone
- [ ] Complete notification still works
- [ ] Last milestone is cleared when sub-piece completes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds

## Notes
- Keep under 100 lines of changes.
- Notification title should be short; body can include both Burmese and English.
- This is the core off-screen feature for the daily focus tool.
