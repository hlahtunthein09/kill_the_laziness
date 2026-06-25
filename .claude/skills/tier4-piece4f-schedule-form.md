# Skill: Tier 4 Piece 4f — ScheduleForm Add Dialog

## Goal
Create a dialog form that lets the user add a new `FocusSessionSchedule` by choosing project, optional sub-piece, day, start time, and duration.

## Files

### Create
- `components/schedule/ScheduleForm.tsx` — add-schedule dialog form.
- `components/schedule/__tests__/ScheduleForm.test.tsx` — form interaction tests.

## Implementation Details

1. `components/schedule/ScheduleForm.tsx`:
   - Client component reading `projects` and `addSchedule` from `useFocusStore`.
   - Use shadcn primitives: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Button`, `Input`, `Label`.
   - Native `<select>` for project, sub-piece, and day to keep line count low.
   - State:
     ```ts
     const [projectId, setProjectId] = useState("");
     const [subPieceId, setSubPieceId] = useState("");
     const [dayOfWeek, setDayOfWeek] = useState(1);
     const [startTime, setStartTime] = useState("09:00");
     const [durationMinutes, setDurationMinutes] = useState(DEFAULT_SCHEDULE_DURATION_MINUTES);
     const [open, setOpen] = useState(false);
     ```
   - Derive selected project and its incomplete sub-pieces for the sub-piece select.
   - When `projectId` changes, reset `subPieceId` to `""`.
   - Submit handler:
     - Validate `projectId` is non-empty.
     - Clamp `durationMinutes` to min 5.
     - Call `addSchedule({ projectId, subPieceId: subPieceId || undefined, dayOfWeek, startTime, durationMinutes })`.
     - Close dialog, reset form.
   - Trigger button: `"အချိန်စဉ် အသစ်ထည့်ရန် (Add Schedule)"` with a `Plus` icon.
   - Burmese-first labels for every field.

2. Field labels (Burmese / English):
   - Project: `"ပရောဂျက် (Project)"`
   - Sub-piece: `"အခန်းကဏ္ဍ (Sub-piece)"` + `"မရွေးပါ (None)"` option
   - Day: `"နေ့ (Day)"`
   - Start time: `"စတင်ချိန် (Start Time)"`
   - Duration: `"ကြာချိန် မိနစ် (Duration min)"`

## Test Strategy

Create `components/schedule/__tests__/ScheduleForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleForm } from '../ScheduleForm';
import { useFocusStore } from '@/lib/store/useFocusStore';

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: vi.fn(),
}));

describe('ScheduleForm', () => {
  const mockAddSchedule = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        projects: [
          {
            id: 'p1',
            name: 'Project One',
            subPieces: [
              { id: 'sp1', name: 'Sub One', status: 'idle' },
              { id: 'sp2', name: 'Sub Two', status: 'completed' },
            ],
          },
        ],
        addSchedule: mockAddSchedule,
      })
    );
  });

  it('renders dialog trigger and form fields', () => {
    render(<ScheduleForm />);
    fireEvent.click(screen.getByText(/Add Schedule/));
    expect(screen.getByLabelText(/Project/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sub-piece/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Day/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Time/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Duration/)).toBeInTheDocument();
  });

  it('submit calls addSchedule with selected values and closes dialog', () => {
    render(<ScheduleForm />);
    fireEvent.click(screen.getByText(/Add Schedule/));

    fireEvent.change(screen.getByLabelText(/Project/), { target: { value: 'p1' } });
    fireEvent.change(screen.getByLabelText(/Sub-piece/), { target: { value: 'sp1' } });
    fireEvent.change(screen.getByLabelText(/Day/), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/Start Time/), { target: { value: '10:30' } });
    fireEvent.change(screen.getByLabelText(/Duration/), { target: { value: '45' } });

    fireEvent.click(screen.getByText(/Save Schedule|စီစဉ်ရန်/));

    expect(mockAddSchedule).toHaveBeenCalledTimes(1);
    expect(mockAddSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'p1',
        subPieceId: 'sp1',
        dayOfWeek: 3,
        startTime: '10:30',
        durationMinutes: 45,
      })
    );
  });

  it('does not submit when project is empty', () => {
    render(<ScheduleForm />);
    fireEvent.click(screen.getByText(/Add Schedule/));
    fireEvent.click(screen.getByText(/Save Schedule|စီစဉ်ရန်/));
    expect(mockAddSchedule).not.toHaveBeenCalled();
  });
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/schedule/__tests__/ScheduleForm.test.tsx` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read `components/settings/SyncPanel.tsx` for Dialog/Form patterns.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- Keep the component under ~80 lines if possible; prefer native `<select>` over shadcn `Select` to save lines.
