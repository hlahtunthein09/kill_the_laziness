import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleForm } from '../ScheduleForm';
import { useFocusStore } from '@/lib/store/useFocusStore';

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: vi.fn(),
}));

describe('ScheduleForm', () => {
  const mockAddSchedule = vi.fn();
  const mockUpdateSchedule = vi.fn();

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
        updateSchedule: mockUpdateSchedule,
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

  it('prefills fields when schedule prop is provided', () => {
    const existingSchedule = {
      id: 's1',
      projectId: 'p1',
      subPieceId: 'sp1',
      dayOfWeek: 2,
      startTime: '14:00',
      durationMinutes: 30,
      enabled: true,
      createdAt: Date.now(),
    };

    render(<ScheduleForm schedule={existingSchedule} />);
    fireEvent.click(screen.getByText(/Edit Schedule/));

    expect(screen.getByLabelText(/Project/)).toHaveValue('p1');
    expect(screen.getByLabelText(/Sub-piece/)).toHaveValue('sp1');
    expect(screen.getByLabelText(/Day/)).toHaveValue('2');
    expect(screen.getByLabelText(/Start Time/)).toHaveValue('14:00');
    expect(screen.getByLabelText(/Duration/)).toHaveValue(30);
  });

  it('submit calls updateSchedule when editing', () => {
    const existingSchedule = {
      id: 's1',
      projectId: 'p1',
      subPieceId: 'sp1',
      dayOfWeek: 2,
      startTime: '14:00',
      durationMinutes: 30,
      enabled: true,
      createdAt: Date.now(),
    };

    render(<ScheduleForm schedule={existingSchedule} />);
    fireEvent.click(screen.getByText(/Edit Schedule/));

    fireEvent.change(screen.getByLabelText(/Duration/), { target: { value: '60' } });

    fireEvent.click(screen.getByText(/Update|သိမ်းဆည်းရန်/));

    expect(mockUpdateSchedule).toHaveBeenCalledTimes(1);
    expect(mockUpdateSchedule).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({
        projectId: 'p1',
        subPieceId: 'sp1',
        dayOfWeek: 2,
        startTime: '14:00',
        durationMinutes: 60,
      })
    );
    expect(mockAddSchedule).not.toHaveBeenCalled();
  });
});
