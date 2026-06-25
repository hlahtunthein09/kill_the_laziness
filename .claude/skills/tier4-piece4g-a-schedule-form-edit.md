# Skill: Tier 4 Piece 4g-a — ScheduleForm Edit Mode

## Goal
Extend `ScheduleForm` so it can edit an existing schedule via an optional `schedule` prop.

## Files

### Modify
- `components/schedule/ScheduleForm.tsx` — add edit mode.
- `components/schedule/__tests__/ScheduleForm.test.tsx` — add edit-mode tests.

## Implementation Details

1. Update `ScheduleForm` props:
   ```ts
   interface ScheduleFormProps {
     schedule?: FocusSessionSchedule;
   }
   ```

2. Read `updateSchedule` from `useFocusStore` alongside `addSchedule`.

3. Initialize form state from `schedule` when editing, otherwise use defaults:
   ```ts
   const [projectId, setProjectId] = useState(schedule?.projectId ?? "");
   const [subPieceId, setSubPieceId] = useState(schedule?.subPieceId ?? "");
   const [dayOfWeek, setDayOfWeek] = useState(schedule?.dayOfWeek ?? 1);
   const [startTime, setStartTime] = useState(schedule?.startTime ?? "09:00");
   const [durationMinutes, setDurationMinutes] = useState(
     schedule?.durationMinutes ?? DEFAULT_SCHEDULE_DURATION_MINUTES
   );
   ```

4. Compute `const isEditing = Boolean(schedule)`.

5. Update submit handler:
   ```ts
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!projectId) return;
     const duration = Math.max(5, durationMinutes);
     const payload = {
       projectId,
       subPieceId: subPieceId || undefined,
       dayOfWeek,
       startTime,
       durationMinutes: duration,
     };
     if (isEditing && schedule) {
       updateSchedule(schedule.id, payload);
     } else {
       addSchedule(payload);
     }
     setOpen(false);
     // reset form to defaults
   };
   ```

6. Update dialog title and button text based on mode:
   - Title: `isEditing ? "အချိန်စဉ် ပြန်ပြင်ရန် (Edit Schedule)" : "အချိန်စဉ် အသစ်ထည့်ရန် (Add Schedule)"`
   - Button: `isEditing ? "သိမ်းဆည်းရန် (Update)" : "စီစဉ်ရန် (Save Schedule)"`

7. Keep all other behavior unchanged (project change resets subPieceId, validation, etc.).

## Test Strategy

Extend `components/schedule/__tests__/ScheduleForm.test.tsx`:

1. `prefills fields when schedule prop is provided`
   - Render `<ScheduleForm schedule={...} />`, open dialog.
   - Assert project, sub-piece, day, time, duration inputs match the schedule.

2. `submit calls updateSchedule when editing`
   - Provide a schedule with `id: 's1'`.
   - Change one field (e.g. duration to 60).
   - Submit.
   - Assert `updateSchedule` called once with `id: 's1'` and updated fields.

3. `submit still calls addSchedule when no schedule prop`
   - Existing test still passes.

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/schedule/__tests__/ScheduleForm.test.tsx` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read only `components/schedule/ScheduleForm.tsx` and its test file.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- If any step fails, fix it before reporting done.
