# Skill: Tier 4 Piece 4g-b — Edit Trigger in ScheduleCard/ScheduleList

## Goal
Add an edit button to `ScheduleCard` and let `ScheduleList` open `ScheduleForm` in edit mode for the selected schedule.

## Files

### Modify
- `components/schedule/ScheduleCard.tsx` — add `onEdit` prop + edit button.
- `components/schedule/__tests__/ScheduleCard.test.tsx` — edit button test.
- `components/schedule/ScheduleForm.tsx` — optional controlled `open`/`onOpenChange` props.
- `components/schedule/ScheduleList.tsx` — manage editing schedule state + render edit form.
- `components/schedule/__tests__/ScheduleList.test.tsx` — edit flow test.

## Implementation Details

1. `ScheduleCard.tsx`:
   - Add `onEdit?: () => void` to props.
   - Add a pencil button next to the delete button:
     ```tsx
     import { Pencil } from "lucide-react";
     ...
     {onEdit && (
       <button
         type="button"
         onClick={onEdit}
         aria-label="Edit schedule"
         className="..."
       >
         <Pencil className="h-4 w-4" />
       </button>
     )}
     ```

2. `ScheduleForm.tsx` — controlled mode support:
   - Update props:
     ```ts
     interface ScheduleFormProps {
       schedule?: FocusSessionSchedule;
       open?: boolean;
       onOpenChange?: (open: boolean) => void;
     }
     ```
   - Compute:
     ```ts
     const isControlled = open !== undefined;
     const [internalOpen, setInternalOpen] = useState(false);
     const dialogOpen = isControlled ? open : internalOpen;
     const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;
     ```
   - Replace all `setOpen` with `setDialogOpen` and `open` with `dialogOpen`.
   - In add-mode trigger, use internal open only (controlled mode won't render trigger).

3. `ScheduleList.tsx`:
   - Add state: `const [editingSchedule, setEditingSchedule] = useState<FocusSessionSchedule | undefined>(undefined);`
   - Pass `onEdit={() => setEditingSchedule(schedule)}` to `ScheduleCard`.
   - Render a controlled `ScheduleForm` for editing:
     ```tsx
     {editingSchedule && (
       <ScheduleForm
         schedule={editingSchedule}
         open={true}
         onOpenChange={(open) => {
           if (!open) setEditingSchedule(undefined);
         }}
       />
     )}
     ```

## Test Strategy

1. `ScheduleCard.test.tsx`:
   - `calls onEdit when edit button is clicked`
   - Render card with `onEdit` mock, click `aria-label="Edit schedule"`, assert called.

2. `ScheduleList.test.tsx`:
   - `opens edit form when edit button is clicked`
   - Mock store with one schedule.
   - Render list, click edit button, assert edit-mode `ScheduleForm` dialog title appears (e.g. `"Edit Schedule"`).

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/schedule/__tests__/ScheduleCard.test.tsx` passes.
- [ ] `npx vitest run components/schedule/__tests__/ScheduleList.test.tsx` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read `ScheduleCard.tsx`, `ScheduleList.tsx`, `ScheduleForm.tsx`, and their tests.
- Do not run the full test suite; run only the targeted test files.
- Do not open a browser or run `npm run dev`.
- If any step fails, fix it before reporting done.
