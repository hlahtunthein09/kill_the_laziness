# Skill: Tier 4 Piece 4e — ScheduleList Component

## Goal
Create a list component that reads schedules from the store, resolves project/sub-piece names, and renders `ScheduleCard` rows with toggle/delete wired.

## Files

### Create
- `components/schedule/ScheduleList.tsx` — list container.
- `components/schedule/__tests__/ScheduleList.test.tsx` — list + empty state tests.

## Implementation Details

1. `components/schedule/ScheduleList.tsx`:
   ```tsx
   "use client";

   import { useFocusStore } from "@/lib/store/useFocusStore";
   import { ScheduleCard } from "./ScheduleCard";
   import { CalendarX } from "lucide-react";

   export function ScheduleList() {
     const schedules = useFocusStore((s) => s.schedules);
     const projects = useFocusStore((s) => s.projects);
     const toggleSchedule = useFocusStore((s) => s.toggleSchedule);
     const deleteSchedule = useFocusStore((s) => s.deleteSchedule);

     const sorted = [...schedules].sort((a, b) => {
       if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
       return a.startTime.localeCompare(b.startTime);
     });

     if (sorted.length === 0) {
       return (
         <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
           <CalendarX className="h-8 w-8 text-stone-400" />
           <p className="text-base font-medium text-stone-700">
             စီစဉ်ထားသော focus အချိန် မရှိသေးပါ
           </p>
           <p className="text-sm text-stone-500">No schedules yet — အသစ်ထည့်ပါ</p>
         </div>
       );
     }

     return (
       <div className="grid gap-3">
         {sorted.map((schedule) => {
           const project = projects.find((p) => p.id === schedule.projectId);
           const subPiece = project?.subPieces.find(
             (sp) => sp.id === schedule.subPieceId
           );

           return (
             <ScheduleCard
               key={schedule.id}
               schedule={schedule}
               projectName={project?.name ?? "အမည်မသိ ပရောဂျက် (Unknown Project)"}
               subPieceName={subPiece?.name}
               onToggle={() => toggleSchedule(schedule.id)}
               onDelete={() => deleteSchedule(schedule.id)}
             />
           );
         })}
       </div>
     );
   }
   ```

2. Empty state is Burmese-first with English subtitle.

## Test Strategy

Create `components/schedule/__tests__/ScheduleList.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleList } from '../ScheduleList';
import { useFocusStore } from '@/lib/store/useFocusStore';
import { DEFAULT_APP_SETTINGS } from '@/lib/constants';

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: vi.fn(),
}));

describe('ScheduleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStore = (overrides = {}) => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        projects: [],
        schedules: [],
        toggleSchedule: vi.fn(),
        deleteSchedule: vi.fn(),
        ...overrides,
      })
    );
  };

  it('renders empty state when no schedules', () => {
    mockStore();
    render(<ScheduleList />);
    expect(screen.getByText('စီစဉ်ထားသော focus အချိန် မရှိသေးပါ')).toBeInTheDocument();
    expect(screen.getByText(/No schedules yet/)).toBeInTheDocument();
  });

  it('renders schedule cards', () => {
    mockStore({
      projects: [
        {
          id: 'p1',
          name: 'Project One',
          subPieces: [{ id: 'sp1', name: 'Sub One' }],
        },
      ],
      schedules: [
        {
          id: 's1',
          projectId: 'p1',
          subPieceId: 'sp1',
          dayOfWeek: 1,
          startTime: '09:00',
          durationMinutes: 25,
          enabled: true,
          createdAt: Date.now(),
        },
      ],
    });

    render(<ScheduleList />);
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Sub One')).toBeInTheDocument();
  });

  it('wires toggle and delete to store actions', () => {
    const toggle = vi.fn();
    const deleteAction = vi.fn();

    mockStore({
      projects: [
        {
          id: 'p1',
          name: 'Project One',
          subPieces: [{ id: 'sp1', name: 'Sub One' }],
        },
      ],
      schedules: [
        {
          id: 's1',
          projectId: 'p1',
          subPieceId: 'sp1',
          dayOfWeek: 1,
          startTime: '09:00',
          durationMinutes: 25,
          enabled: true,
          createdAt: Date.now(),
        },
      ],
      toggleSchedule: toggle,
      deleteSchedule: deleteAction,
    });

    render(<ScheduleList />);

    fireEvent.click(screen.getByLabelText('Toggle schedule'));
    expect(toggle).toHaveBeenCalledWith('s1');

    fireEvent.click(screen.getByLabelText('Delete schedule'));
    expect(deleteAction).toHaveBeenCalledWith('s1');
  });
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/schedule/__tests__/ScheduleList.test.tsx` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read `ScheduleCard.tsx` and a similar list component (e.g. `components/projects/ProjectList.tsx`) for patterns.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- This is a client component because it reads from `useFocusStore`.
