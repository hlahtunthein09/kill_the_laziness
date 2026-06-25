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

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(
      <ScheduleCard
        schedule={schedule}
        projectName="My Project"
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />
    );

    fireEvent.click(screen.getByLabelText('Edit schedule'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
