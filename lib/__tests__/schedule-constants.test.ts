import { describe, it, expect } from 'vitest';
import { DEFAULT_SCHEDULE_DURATION_MINUTES } from '@/lib/constants';
import type { FocusSessionSchedule } from '@/lib/types';

describe('schedule constants', () => {
  it('default schedule duration is 25 minutes', () => {
    expect(DEFAULT_SCHEDULE_DURATION_MINUTES).toBe(25);
  });

  it('FocusSessionSchedule type can construct a schedule object', () => {
    const schedule: FocusSessionSchedule = {
      id: 'sched-1',
      projectId: 'proj-1',
      subPieceId: 'sub-1',
      dayOfWeek: 1,
      startTime: '09:00',
      durationMinutes: DEFAULT_SCHEDULE_DURATION_MINUTES,
      enabled: true,
      createdAt: 1_700_000_000_000,
    };
    expect(schedule.dayOfWeek).toBe(1);
    expect(schedule.enabled).toBe(true);
  });
});
