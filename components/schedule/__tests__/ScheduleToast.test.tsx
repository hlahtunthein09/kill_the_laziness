import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ScheduleToast } from '../ScheduleToast';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
    const spyInfo = vi.spyOn(toast, 'info').mockImplementation(() => 'toast-id');
    render(<ScheduleToast dueSchedule={dueSchedule} projectName="My Project" subPieceName="My Sub" />);
    expect(spyInfo).toHaveBeenCalledTimes(1);
    expect(spyInfo).toHaveBeenCalledWith(
      expect.stringContaining('စီစဉ်ထားသော focus'),
      expect.objectContaining({
        description: expect.stringContaining('My Project'),
      })
    );
    spyInfo.mockRestore();
  });

  it('does not call toast again for the same schedule id', () => {
    const spyInfo = vi.spyOn(toast, 'info').mockImplementation(() => 'toast-id');
    const { rerender } = render(
      <ScheduleToast dueSchedule={dueSchedule} />
    );
    expect(spyInfo).toHaveBeenCalledTimes(1);

    rerender(<ScheduleToast dueSchedule={dueSchedule} />);
    expect(spyInfo).toHaveBeenCalledTimes(1);
    spyInfo.mockRestore();
  });

  it('renders nothing', () => {
    const { container } = render(<ScheduleToast />);
    expect(container.firstChild).toBeNull();
  });
});
