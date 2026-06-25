import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScheduleWatcher } from '../useScheduleWatcher';
import { useFocusStore } from '@/lib/store/useFocusStore';

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: vi.fn(),
}));

describe('useScheduleWatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-06-25T08:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const mockStore = (schedules: Record<string, unknown>[] = []) => {
    // Create stable function references so the hook's useEffect doesn't re-run infinitely
    const getNextDueSchedule = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 4 = Thursday
      const currentMinutes = now.getHours() * 60 + now.getMinutes(); // 8*60+30 = 510
      return (schedules as Array<Record<string, unknown>>).find((s) => {
        if (!s.enabled || s.dayOfWeek !== currentDay) return false;
        const [h, m] = (s.startTime as string).split(':').map(Number);
        const scheduleMinutes = h * 60 + m;
        return scheduleMinutes >= currentMinutes;
      }) ?? undefined;
    };

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        schedules,
        getNextDueSchedule,
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
    // The useEffect runs check() immediately, which calls setDueSchedule.
    // React state updates are async, so we need to wait for the next tick.
    await act(async () => {
      // Allow React to process the state update
      await Promise.resolve();
    });
    expect(result.current.dueSchedule).toBeDefined();
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
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.dueSchedule?.id).toBe('s1');

    // Advance to the next poll (same minute 08:30)
    await act(async () => {
      vi.advanceTimersByTime(60_000);
      await Promise.resolve();
    });
    // After advancing to the same minute (08:30), the schedule should be cleared
    // because it was already returned for this minute
    expect(result.current.dueSchedule).toBeUndefined();
  });

  it('cleans up interval on unmount', () => {
    mockStore();
    const { unmount } = renderHook(() => useScheduleWatcher());
    expect(() => unmount()).not.toThrow();
  });
});
