import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleList } from '../ScheduleList';
import { useFocusStore } from '@/lib/store/useFocusStore';

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

  it('renders schedule cards with project/sub-piece names', () => {
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

  it('wires toggle and delete to store actions with correct id', () => {
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

  it('opens edit form when edit button is clicked', () => {
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
    fireEvent.click(screen.getByLabelText('Edit schedule'));
    expect(screen.getByText('အချိန်စဉ် ပြန်ပြင်ရန် (Edit Schedule)')).toBeInTheDocument();
  });
});
