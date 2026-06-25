import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFocusStore } from '../useFocusStore';
import { DEFAULT_APP_SETTINGS } from '@/lib/constants';

const baseScheduleInput = {
  projectId: 'proj-1',
  subPieceId: 'sub-1',
  dayOfWeek: 1,
  startTime: '09:00',
  durationMinutes: 25,
};

describe('ScheduleSlice', () => {
  beforeEach(() => {
    useFocusStore.setState({
      projects: [],
      activeProjectId: null,
      settings: { ...DEFAULT_APP_SETTINGS },
      logs: [],
      hasHydrated: false,
      schedules: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with empty schedules', () => {
    expect(useFocusStore.getState().schedules).toEqual([]);
  });

  it('addSchedule creates an enabled schedule with id and createdAt', () => {
    const before = Date.now();
    const schedule = useFocusStore.getState().addSchedule(baseScheduleInput);
    const after = Date.now();

    expect(schedule.projectId).toBe('proj-1');
    expect(schedule.enabled).toBe(true);
    expect(schedule.createdAt).toBeGreaterThanOrEqual(before);
    expect(schedule.createdAt).toBeLessThanOrEqual(after);
    expect(schedule.id).toBeDefined();

    expect(useFocusStore.getState().schedules).toHaveLength(1);
  });

  it('deleteSchedule removes the schedule', () => {
    const schedule = useFocusStore.getState().addSchedule(baseScheduleInput);
    useFocusStore.getState().deleteSchedule(schedule.id);
    expect(useFocusStore.getState().schedules).toHaveLength(0);
  });

  it('toggleSchedule flips enabled state', () => {
    const schedule = useFocusStore.getState().addSchedule(baseScheduleInput);
    expect(schedule.enabled).toBe(true);

    useFocusStore.getState().toggleSchedule(schedule.id);
    expect(useFocusStore.getState().schedules[0].enabled).toBe(false);

    useFocusStore.getState().toggleSchedule(schedule.id);
    expect(useFocusStore.getState().schedules[0].enabled).toBe(true);
  });

  it('updateSchedule changes schedule fields', () => {
    const schedule = useFocusStore.getState().addSchedule(baseScheduleInput);
    useFocusStore.getState().updateSchedule(schedule.id, {
      startTime: '10:00',
      durationMinutes: 30,
    });

    const updated = useFocusStore.getState().schedules[0];
    expect(updated.startTime).toBe('10:00');
    expect(updated.durationMinutes).toBe(30);
    expect(updated.id).toBe(schedule.id);
    expect(updated.createdAt).toBe(schedule.createdAt);
  });

  it('updateSchedule ignores id and createdAt', () => {
    const schedule = useFocusStore.getState().addSchedule(baseScheduleInput);
    useFocusStore.getState().updateSchedule(schedule.id, {
      id: 'new-id',
      createdAt: 999,
    } as Record<string, unknown>);

    const updated = useFocusStore.getState().schedules[0];
    expect(updated.id).toBe(schedule.id);
    expect(updated.createdAt).toBe(schedule.createdAt);
  });

  it('getSchedulesForDay returns enabled schedules for the given day sorted by startTime', () => {
    const store = useFocusStore.getState();
    store.addSchedule({ ...baseScheduleInput, dayOfWeek: 1, startTime: '10:00' });
    store.addSchedule({ ...baseScheduleInput, dayOfWeek: 1, startTime: '08:00' });
    store.addSchedule({ ...baseScheduleInput, dayOfWeek: 2, startTime: '09:00' });

    const monday = store.getSchedulesForDay(1);
    expect(monday).toHaveLength(2);
    expect(monday[0].startTime).toBe('08:00');
    expect(monday[1].startTime).toBe('10:00');

    const tuesday = store.getSchedulesForDay(2);
    expect(tuesday).toHaveLength(1);
    expect(tuesday[0].startTime).toBe('09:00');
  });

  it('getNextDueSchedule returns the earliest future schedule', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T08:30:00'));

    const store = useFocusStore.getState();
    store.addSchedule({ ...baseScheduleInput, dayOfWeek: 4, startTime: '08:00' });
    store.addSchedule({ ...baseScheduleInput, dayOfWeek: 4, startTime: '09:00' });

    const next = store.getNextDueSchedule();
    expect(next).toBeDefined();
    expect(next!.startTime).toBe('09:00');

    vi.useRealTimers();
  });

  it('getNextDueSchedule returns undefined when no schedules exist', () => {
    expect(useFocusStore.getState().getNextDueSchedule()).toBeUndefined();
  });

  it('getNextDueSchedule rolls over to the next day when today\'s schedules are past', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T18:00:00'));

    const store = useFocusStore.getState();
    store.addSchedule({ ...baseScheduleInput, dayOfWeek: 4, startTime: '09:00' });
    store.addSchedule({ ...baseScheduleInput, dayOfWeek: 5, startTime: '08:00' });

    const next = store.getNextDueSchedule();
    expect(next).toBeDefined();
    expect(next!.dayOfWeek).toBe(5);
    expect(next!.startTime).toBe('08:00');

    vi.useRealTimers();
  });
});
