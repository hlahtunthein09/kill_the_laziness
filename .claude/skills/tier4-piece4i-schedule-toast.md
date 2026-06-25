# Skill: Tier 4 Piece 4i — ScheduleToast Component

## Goal
Show a `sonner` toast when a schedule becomes due, with a Burmese-first message and a button to navigate to `/timer`.

## Files

### Create
- `components/schedule/ScheduleToast.tsx` — toast trigger component.
- `components/schedule/__tests__/ScheduleToast.test.tsx` — toast interaction tests.

## Implementation Details

1. `components/schedule/ScheduleToast.tsx`:
   ```tsx
   "use client";

   import { useEffect, useRef } from "react";
   import { toast } from "sonner";
   import { useRouter } from "next/navigation";
   import type { FocusSessionSchedule } from "@/lib/types";

   interface ScheduleToastProps {
     dueSchedule?: FocusSessionSchedule;
     projectName?: string;
     subPieceName?: string;
   }

   export function ScheduleToast({
     dueSchedule,
     projectName,
     subPieceName,
   }: ScheduleToastProps) {
     const router = useRouter();
     const shownRef = useRef<Set<string>>(new Set());

     useEffect(() => {
       if (!dueSchedule) return;
       if (shownRef.current.has(dueSchedule.id)) return;

       shownRef.current.add(dueSchedule.id);

       toast.info(
         `စီစဉ်ထားသော focus အချိန် ရောက်ပါပြီ (Scheduled Focus)`,
         {
           description: `${projectName ?? "ပရောဂျက်"} · ${subPieceName ?? "အထွေထွေ focus"} · ${dueSchedule.startTime}`,
           action: {
             label: "စတင်မယ် (Start)",
             onClick: () => router.push("/timer"),
           },
         }
       );
     }, [dueSchedule, projectName, subPieceName, router]);

     return null;
   }
   ```

2. The component renders nothing; it only triggers toasts.

## Test Strategy

Create `components/schedule/__tests__/ScheduleToast.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ScheduleToast } from '../ScheduleToast';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

vi.mock('sonner', () => ({
  toast: { info: vi.fn() },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('ScheduleToast', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - mock return
    useRouter.mockReturnValue({ push: mockPush });
  });

  const dueSchedule = {
    id: 's1',
    projectId: 'p1',
    subPieceId: 'sp1',
    dayOfWeek: 1,
    startTime: '09:00',
    durationMinutes: 25,
    enabled: true,
    createdAt: Date.now(),
  };

  it('calls toast.info when dueSchedule is provided', () => {
    render(<ScheduleToast dueSchedule={dueSchedule} projectName="My Project" subPieceName="My Sub" />);
    expect(toast.info).toHaveBeenCalledTimes(1);
    expect(toast.info).toHaveBeenCalledWith(
      expect.stringContaining('စီစဉ်ထားသော focus'),
      expect.objectContaining({
        description: expect.stringContaining('My Project'),
      })
    );
  });

  it('does not call toast again for the same schedule id', () => {
    const { rerender } = render(
      <ScheduleToast dueSchedule={dueSchedule} />
    );
    expect(toast.info).toHaveBeenCalledTimes(1);

    rerender(<ScheduleToast dueSchedule={dueSchedule} />);
    expect(toast.info).toHaveBeenCalledTimes(1);
  });

  it('renders nothing', () => {
    const { container } = render(<ScheduleToast />);
    expect(container.firstChild).toBeNull();
  });
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/schedule/__tests__/ScheduleToast.test.tsx` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read `components/timer/TimerToast.tsx` for sonner toast patterns.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- Keep component under ~50 lines.
- If any step fails, fix it before reporting done.
