# Skill: Tier 4 Piece 4d — ScheduleCard Component

## Goal
Create a presentational card that displays one `FocusSessionSchedule` with project/sub-piece names, day/time, duration, enable toggle, and delete action.

## Files

### Create
- `components/schedule/ScheduleCard.tsx` — schedule row card.
- `components/schedule/__tests__/ScheduleCard.test.tsx` — rendering + interaction tests.

## Implementation Details

1. `components/schedule/ScheduleCard.tsx`:
   ```tsx
   "use client";

   import { cn } from "@/lib/utils";
   import type { FocusSessionSchedule } from "@/lib/types";
   import { Trash2 } from "lucide-react";

   const DAY_LABELS = [
     "အိတ်ကို (Sun)",
     "တနင်္လာ (Mon)",
     "အင်္ဂါ (Tue)",
     "ဗုဒ္ဓဟူး (Wed)",
     "ကြာသပတေးနေ့ (Thu)",
     "သောကြာနေ့ (Fri)",
     "စနေနေ့ (Sat)",
   ];

   interface ScheduleCardProps {
     schedule: FocusSessionSchedule;
     projectName: string;
     subPieceName?: string;
     onToggle: () => void;
     onDelete: () => void;
   }

   export function ScheduleCard({
     schedule,
     projectName,
     subPieceName,
     onToggle,
     onDelete,
   }: ScheduleCardProps) {
     return (
       <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
         <div className="flex-1 min-w-0">
           <p className="font-semibold text-stone-900 truncate">{projectName}</p>
           <p className="text-sm text-stone-500 truncate">
             {subPieceName ?? "အထွေထွေ focus (General Focus)"}
           </p>
           <p className="text-sm text-stone-600 mt-1">
             {DAY_LABELS[schedule.dayOfWeek]} · {schedule.startTime} · {schedule.durationMinutes} min
           </p>
         </div>

         <div className="flex items-center gap-3 shrink-0">
           <label className="relative inline-flex items-center cursor-pointer">
             <input
               type="checkbox"
               className="sr-only peer"
               checked={schedule.enabled}
               onChange={onToggle}
               aria-label="Toggle schedule"
             />
             <div
               className={cn(
                 "w-10 h-5 rounded-full transition-colors duration-200",
                 schedule.enabled ? "bg-teal-500" : "bg-stone-300"
               )}
             />
             <div
               className={cn(
                 "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                 schedule.enabled ? "translate-x-5" : "translate-x-0"
               )}
             />
           </label>

           <button
             type="button"
             onClick={onDelete}
             className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
             aria-label="Delete schedule"
           >
             <Trash2 className="h-4 w-4" />
           </button>
         </div>
       </div>
     );
   }
   ```

2. Keep all text Burmese-first with English subtitle in parentheses.

## Test Strategy

Create `components/schedule/__tests__/ScheduleCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleCard } from '../ScheduleCard';
import type { FocusSessionSchedule } from '@/lib/types';

const schedule: FocusSessionSchedule = {
  id: 's1',
  projectId: 'p1',
  subPieceId: 'sp1',
  dayOfWeek: 1,
  startTime: '09:00',
  durationMinutes: 25,
  enabled: true,
  createdAt: Date.now(),
};

describe('ScheduleCard', () => {
  it('renders project, sub-piece, day, time and duration', () => {
    render(
      <ScheduleCard
        schedule={schedule}
        projectName="My Project"
        subPieceName="My Sub-piece"
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('My Project')).toBeInTheDocument();
    expect(screen.getByText('My Sub-piece')).toBeInTheDocument();
    expect(screen.getByText(/တနင်္လာ \(Mon\)/)).toBeInTheDocument();
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
    expect(screen.getByText(/25 min/)).toBeInTheDocument();
  });

  it('calls onToggle when toggle is clicked', () => {
    const onToggle = vi.fn();
    render(
      <ScheduleCard
        schedule={schedule}
        projectName="My Project"
        onToggle={onToggle}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText('Toggle schedule'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(
      <ScheduleCard
        schedule={schedule}
        projectName="My Project"
        onToggle={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByLabelText('Delete schedule'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/schedule/__tests__/ScheduleCard.test.tsx` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read `SoundToggle.tsx` for the toggle switch pattern.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- Component must be a client component (uses props/event handlers, no store reads).
