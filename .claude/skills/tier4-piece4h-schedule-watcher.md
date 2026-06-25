# Skill: Tier 4 Piece 4h — useScheduleWatcher Hook

## Goal
Create a polling hook that surfaces a due schedule at most once per minute.

## Files

### Create
- `hooks/useScheduleWatcher.ts` — polling hook.
- `hooks/__tests__/useScheduleWatcher.test.ts` — hook behavior tests.

## Implementation Details

1. `hooks/useScheduleWatcher.ts`:
   ```ts
   "use client";

   import { useEffect, useRef, useState } from "react";
   import { useFocusStore } from "@/lib/store/useFocusStore";
   import type { FocusSessionSchedule } from "@/lib/types";

   export interface UseScheduleWatcherResult {
     dueSchedule: FocusSessionSchedule | undefined;
   }

   export function useScheduleWatcher(): UseScheduleWatcherResult {
     const getNextDueSchedule = useFocusStore((s) => s.getNextDueSchedule);
     const schedules = useFocusStore((s) => s.schedules);

     const [dueSchedule, setDueSchedule] = useState<FocusSessionSchedule | undefined>(undefined);
     const lastNotifiedRef = useRef<{ id: string; minute: number } | null>(null);

     useEffect(() => {
       function check() {
         const next = getNextDueSchedule();
         const now = new Date();
         const currentMinute = now.getHours() * 60 + now.getMinutes();

         if (
           next &&
           (lastNotifiedRef.current?.id !== next.id ||
             lastNotifiedRef.current?.minute !== currentMinute)
         ) {
           lastNotifiedRef.current = { id: next.id, minute: currentMinute };
           setDueSchedule(next);
         } else {
           setDueSchedule(undefined);
         }
       }

       check();
       const interval = setInterval(check, 60_000);
       return () => clearInterval(interval);
     }, [getNextDueSchedule, schedules.length]);

     return { dueSchedule };
   }
   ```

2. The hook depends on `schedules.length` so it re-checks when schedules are added/deleted. Updates to existing schedules (e.g. time change) will be picked up on the next poll.

3. `dueSchedule` is cleared when no schedule is due or when the same schedule/minute was already returned.

## Test Strategy

Create `hooks/__tests__/useScheduleWatcher.test.ts`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useScheduleWatcher } from '../useScheduleWatcher';
import { useFocusStore } from '@/lib/store/useFocusStore';
import { DEFAULT_APP_SETTINGS } from '@/lib/constants';

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: vi.fn(),
}));

describe('useScheduleWatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T08:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const mockStore = (schedules = []) => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        schedules,
        getNextDueSchedule: () =>
          schedules.find((s) => {
            if (!s.enabled || s.dayOfWeek !== 4) return false;
            const [h, m] = s.startTime.split(':').map(Number);
            return h * 60 + m >= 8 * 60 + 30;
          }) ?? undefined,
      })
    );
  };

  it('returns undefined when no schedules exist', () => {
    mockStore();
    const { result } = renderHook(() => useScheduleWatcher());
    expect(result.current.dueSchedule).toBeUndefined();
  });

  it('returns a due schedule when current time matches', async () => {
    mockStore([
      {
        id: 's1',
        projectId: 'p1',
        dayOfWeek: 4,
        startTime: '08:30',
        durationMinutes: 25,
        enabled: true,
        createdAt: Date.now(),
      },
    ]);

    const { result } = renderHook(() => useScheduleWatcher());
    await waitFor(() => expect(result.current.dueSchedule).toBeDefined());
    expect(result.current.dueSchedule?.id).toBe('s1');
  });

  it('does not return the same schedule twice in the same minute', async () => {
    mockStore([
      {
        id: 's1',
        projectId: 'p1',
        dayOfWeek: 4,
        startTime: '08:30',
        durationMinutes: 25,
        enabled: true,
        createdAt: Date.now(),
      },
    ]);

    const { result } = renderHook(() => useScheduleWatcher());
    await waitFor(() => expect(result.current.dueSchedule?.id).toBe('s1'));

    // After the hook clears dueSchedule on next render, advance timers and re-check
    vi.advanceTimersByTime(60_000);
    await waitFor(() => expect(result.current.dueSchedule).toBeUndefined());
  });

  it('cleans up interval on unmount', () => {
    mockStore();
    const { unmount } = renderHook(() => useScheduleWatcher());
    expect(() => unmount()).not.toThrow();
  });
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run hooks/__tests__/useScheduleWatcher.test.ts` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read `hooks/useTimer.ts` for polling/interval patterns.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- Keep hook under ~70 lines.
- If any step fails, fix it before reporting done.
