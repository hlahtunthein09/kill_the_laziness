# Skill: Tier 4 Piece 4c — Store Slice Update + Getters

## Goal
Extend the schedule slice with `updateSchedule` and read-only getter helpers.

## Files

### Modify
- `lib/store/slices/scheduleSlice.ts` — add `updateSchedule`, `getSchedulesForDay`, `getNextDueSchedule`.
- `lib/store/__tests__/scheduleSlice.test.ts` — add tests for update and getters.

## Implementation Details

1. Extend `ScheduleSlice` interface in `lib/store/slices/scheduleSlice.ts`:
   ```ts
   updateSchedule: (
     id: string,
     updates: Partial<Omit<FocusSessionSchedule, "id" | "createdAt">>
   ) => void;
   getSchedulesForDay: (dayOfWeek: number) => FocusSessionSchedule[];
   getNextDueSchedule: () => FocusSessionSchedule | undefined;
   ```

2. Implement `updateSchedule`:
   ```ts
   updateSchedule: (id, updates) => {
     set((state) => ({
       schedules: state.schedules.map((s) =>
         s.id === id ? { ...s, ...updates } : s
       ),
     }));
   },
   ```

3. Implement `getSchedulesForDay(dayOfWeek)`:
   - Return enabled schedules whose `dayOfWeek` matches.
   - Sort ascending by `startTime` string (`"HH:mm"`).

4. Implement `getNextDueSchedule()`:
   - Use `new Date()` to get current `dayOfWeek` (0 Sun - 6 Sat) and current minutes-since-midnight.
   - Search the next 7 days (today + 6 forward) for an enabled schedule.
   - For today, only consider `startTime` >= current time.
   - For future days, consider any enabled schedule.
   - Return the first matching schedule sorted by day distance then `startTime`.
   - Return `undefined` if none found.

## Test Strategy

Extend `lib/store/__tests__/scheduleSlice.test.ts`:

1. `updateSchedule changes schedule fields`
   - Add a schedule, call `updateSchedule(id, { startTime: '10:00', durationMinutes: 30 })`.
   - Assert `startTime` and `durationMinutes` updated; `id` and `createdAt` unchanged.

2. `updateSchedule ignores id and createdAt`
   - Call `updateSchedule(id, { id: 'new-id', createdAt: 999 })`.
   - Assert original `id` and `createdAt` remain.

3. `getSchedulesForDay returns enabled schedules for the given day sorted by startTime`
   - Add schedules for Monday and Tuesday at various times.
   - Assert Monday list length and order.

4. `getNextDueSchedule returns the earliest future schedule`
   - Use `vi.useFakeTimers()` + `vi.setSystemTime(new Date('2026-06-25T08:30:00'))`.
   - Add an earlier schedule (08:00) and a later schedule (09:00) for the same day.
   - Assert `getNextDueSchedule()` returns the 09:00 schedule.

5. `getNextDueSchedule returns undefined when no schedules exist`
   - Assert `getNextDueSchedule()` is `undefined`.

6. `getNextDueSchedule rolls over to the next day when today's schedules are past`
   - Set current time to 18:00.
   - Add an enabled schedule for today at 09:00 and one for tomorrow at 08:00.
   - Assert `getNextDueSchedule()` returns tomorrow's schedule.

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run lib/store/__tests__/scheduleSlice.test.ts` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read only `lib/store/slices/scheduleSlice.ts` and its existing test file.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- Keep `getNextDueSchedule` simple; do not add external date libraries.
