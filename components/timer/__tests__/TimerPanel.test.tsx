import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TimerPanel } from "../TimerPanel";
import { useFocusStore } from "@/lib/store/useFocusStore";
import type { Project, SubPiece } from "@/lib/types";
import { mockPush } from "@/__mocks__/next-navigation";
import { toast } from "sonner";

const restartProjectMock = vi.fn();
const setActiveProjectMock = vi.fn();

// Mock the store
vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: Object.assign(vi.fn(), {
    getState: () => ({
      restartProject: restartProjectMock,
      setActiveProject: setActiveProjectMock,
    }),
  }),
}));

// Mock useTimer hook
vi.mock("@/hooks/useTimer", () => ({
  useTimer: vi.fn(() => ({
    isRunning: false,
    projectElapsed: 0,
    subPieceRemaining: 0,
    targetReached: false,
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    reinitialize: vi.fn(),
    resetToZero: vi.fn(),
    restart: vi.fn(),
  })),
}));

// Mock useScheduleWatcher hook
vi.mock("@/hooks/useScheduleWatcher", () => ({
  useScheduleWatcher: vi.fn(() => ({
    dueSchedule: undefined,
  })),
}));

// Mock sound module to avoid useFocusStore.getState() issues
vi.mock("@/lib/sound", () => ({
  playCompleteSound: vi.fn(),
  playMilestoneSound: vi.fn(),
}));

// Mock SubPieceForm to avoid store interactions
vi.mock("@/components/projects/SubPieceForm", () => ({
  SubPieceForm: function SubPieceFormMock() {
    return null;
  },
}));

import { useTimer } from "@/hooks/useTimer";
import { useScheduleWatcher } from "@/hooks/useScheduleWatcher";

function createMockSubPiece(overrides: Partial<SubPiece> = {}): SubPiece {
  return {
    id: "sp-1",
    projectId: "proj-1",
    name: "Test SubPiece",
    allocatedMinutes: 25,
    elapsedSeconds: 0,
    status: "idle",
    order: 0,
    ...overrides,
  };
}

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj-1",
    name: "Test Project",
    description: "A test project",
    color: "mint",
    createdAt: Date.now(),
    totalTimeSeconds: 0,
    targetTimeSeconds: 3600,
    status: "idle",
    fortressLevel: 1,
    fortressHealth: 100,
    xp: 0,
    subPieces: [createMockSubPiece()],
    ...overrides,
  };
}

describe("TimerPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    restartProjectMock.mockClear();
    setActiveProjectMock.mockClear();
  });

  it("shows empty state when no active project", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [], activeProjectId: null, activeSubPieceId: null })
    );

    render(<TimerPanel />);

    expect(
      screen.getByText(/လက်ရှိ ပရောဂျက် မရွေးရသေးပါ/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/No active project/i)).toBeInTheDocument();
  });

  it("navigates to /projects when CTA button is clicked in empty state", () => {
    mockPush.mockClear();

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [], activeProjectId: null, activeSubPieceId: null })
    );

    render(<TimerPanel />);

    const ctaButton = screen.getByText(/ပရောဂျက်တစ်ခုရွေးချယ်ပါ/i);
    expect(ctaButton).toBeInTheDocument();

    fireEvent.click(ctaButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/projects");
  });

  it("renders timer UI when active project has no incomplete sub-pieces", () => {
    const project = createMockProject({
      subPieces: [createMockSubPiece({ status: "completed" })],
    });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 120,
      subPieceRemaining: 0,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      reinitialize: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    // Project name should be visible
    expect(screen.getByText("Test Project")).toBeInTheDocument();

    // Placeholder subtitle should be visible
    expect(screen.getByText(/Project Focus/i)).toBeInTheDocument();

    // Timer controls should be present
    expect(screen.getByTestId("timer-start")).toBeInTheDocument();

    // Discard Session reset button should be present
    expect(screen.getByTestId("timer-reset")).toBeInTheDocument();

    // Red Reset to Zero button should NOT be present when no sub-piece
    expect(screen.queryByTestId("timer-reset-to-zero")).not.toBeInTheDocument();
  });

  it("renders TimerDisplay and TimerControls when active project has an incomplete sub-piece", () => {
    const project = createMockProject();

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 120,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      reinitialize: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    // Project name and sub-piece name should be visible
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Test SubPiece", { selector: "p" })).toBeInTheDocument();

    // Timer controls should be present
    expect(screen.getByTestId("timer-start")).toBeInTheDocument();

    // Reset buttons are no longer rendered by TimerControls

    // Timer display status badge should be present
    expect(screen.getByText(/Paused/i)).toBeInTheDocument();
  });

  it("shows running state when timer is active", () => {
    const project = createMockProject();

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: true,
      projectElapsed: 300,
      subPieceRemaining: 1200,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    expect(screen.getByText(/Running/i)).toBeInTheDocument();
  });

  it("picks the first incomplete sub-piece when multiple exist", () => {
    const subPieces: SubPiece[] = [
      createMockSubPiece({
        id: "sp-1",
        name: "Completed SubPiece",
        status: "completed",
      }),
      createMockSubPiece({
        id: "sp-2",
        name: "Active SubPiece",
        status: "idle",
      }),
    ];

    const project = createMockProject({ subPieces });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    // Should show the first incomplete sub-piece name
    expect(screen.getByText("Active SubPiece", { selector: "p" })).toBeInTheDocument();
  });

  it("does not crash when transitioning from no active project to active project", () => {
    const { rerender } = render(<TimerPanel />);

    // Initial state: no active project
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [], activeProjectId: null })
    );

    rerender(<TimerPanel />);

    expect(
      screen.getByText(/လက်ရှိ ပရောဂျက် မရွေးရသေးပါ/i)
    ).toBeInTheDocument();

    // Transition: now we have an active project with an incomplete sub-piece
    const project = createMockProject();

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      resetToZero: vi.fn(),
    });

    // This rerender must not throw a React hooks-order error
    rerender(<TimerPanel />);

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Test SubPiece", { selector: "p" })).toBeInTheDocument();
  });

  it("does not crash when transitioning from no active project to active project", () => {
    const { rerender } = render(<TimerPanel />);

    // Initial state: no active project
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [], activeProjectId: null, activeSubPieceId: null })
    );

    rerender(<TimerPanel />);

    expect(
      screen.getByText(/လက်ရှိ ပရောဂျက် မရွေးရသေးပါ/i)
    ).toBeInTheDocument();

    // Transition: now we have an active project with an incomplete sub-piece
    const project = createMockProject();

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      resetToZero: vi.fn(),
    });

    // This rerender must not throw a React hooks-order error
    rerender(<TimerPanel />);

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Test SubPiece", { selector: "p" })).toBeInTheDocument();
  });

  it("uses activeSubPieceId when set to an incomplete sub-piece", () => {
    const subPieces: SubPiece[] = [
      createMockSubPiece({
        id: "sp-1",
        name: "First SubPiece",
        status: "idle",
      }),
      createMockSubPiece({
        id: "sp-2",
        name: "Explicitly Selected SubPiece",
        status: "idle",
      }),
    ];

    const project = createMockProject({ subPieces });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: "sp-2" })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    // Should show the explicitly selected sub-piece, not the first one
    expect(screen.getByText("Explicitly Selected SubPiece", { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByText("First SubPiece")).not.toBeInTheDocument();
  });

  it("falls back to first incomplete sub-piece when activeSubPieceId is completed", () => {
    const subPieces: SubPiece[] = [
      createMockSubPiece({
        id: "sp-1",
        name: "Fallback SubPiece",
        status: "idle",
      }),
      createMockSubPiece({
        id: "sp-2",
        name: "Completed Selected SubPiece",
        status: "completed",
      }),
    ];

    const project = createMockProject({ subPieces });

    // activeSubPieceId points to a completed sub-piece — should fall back
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: "sp-2" })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    // Should fall back to the first incomplete sub-piece
    expect(screen.getByText("Fallback SubPiece", { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByText("Completed Selected SubPiece")).not.toBeInTheDocument();
  });

  it("renders project-only timer UI when projectOnlyFocus is true even with incomplete sub-pieces", () => {
    const subPieces: SubPiece[] = [
      createMockSubPiece({
        id: "sp-1",
        name: "SubPiece That Should Not Show",
        status: "idle",
      }),
    ];

    const project = createMockProject({ subPieces });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        projects: [project],
        activeProjectId: "proj-1",
        activeSubPieceId: null,
        projectOnlyFocus: true,
      })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 120,
      subPieceRemaining: 0,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      reinitialize: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    // Project name should be visible
    expect(screen.getByText("Test Project")).toBeInTheDocument();

    // Project-only subtitle should be visible (not the sub-piece name)
    expect(screen.getByText(/Project Focus/i)).toBeInTheDocument();

    // Sub-piece name should NOT be visible
    expect(
      screen.queryByText("SubPiece That Should Not Show")
    ).not.toBeInTheDocument();

    // Timer controls should be present
    expect(screen.getByTestId("timer-start")).toBeInTheDocument();
  });

  it("falls back to first incomplete sub-piece when activeSubPieceId is invalid", () => {
    const subPieces: SubPiece[] = [
      createMockSubPiece({
        id: "sp-1",
        name: "Fallback SubPiece",
        status: "idle",
      }),
    ];

    const project = createMockProject({ subPieces });

    // activeSubPieceId points to a non-existent sub-piece — should fall back
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: "sp-nonexistent" })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    // Should fall back to the first incomplete sub-piece
    expect(screen.getByText("Fallback SubPiece", { selector: "p" })).toBeInTheDocument();
  });

  it("renders project-only timer UI when projectOnlyFocus is true even with incomplete sub-pieces", () => {
    const subPieces: SubPiece[] = [
      createMockSubPiece({
        id: "sp-1",
        name: "SubPiece That Should Not Show",
        status: "idle",
      }),
    ];

    const project = createMockProject({ subPieces });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        projects: [project],
        activeProjectId: "proj-1",
        activeSubPieceId: null,
        projectOnlyFocus: true,
      })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 120,
      subPieceRemaining: 0,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      reinitialize: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    // Project name should be visible
    expect(screen.getByText("Test Project")).toBeInTheDocument();

    // Project-only subtitle should be visible (not the sub-piece name)
    expect(screen.getByText(/Project Focus/i)).toBeInTheDocument();

    // Sub-piece name should NOT be visible
    expect(
      screen.queryByText("SubPiece That Should Not Show")
    ).not.toBeInTheDocument();

    // Timer controls should be present
    expect(screen.getByTestId("timer-start")).toBeInTheDocument();
  });

  it("falls back to first incomplete sub-piece when projectOnlyFocus is false", () => {
    const subPieces: SubPiece[] = [
      createMockSubPiece({
        id: "sp-1",
        name: "Fallback SubPiece",
        status: "idle",
      }),
    ];

    const project = createMockProject({ subPieces });

    // activeSubPieceId points to a non-existent sub-piece — should fall back
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: "sp-nonexistent" })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    // Should fall back to the first incomplete sub-piece
    expect(screen.getByText("Fallback SubPiece", { selector: "p" })).toBeInTheDocument();
  });

  it("renders target label and progress bar when active project has targetTimeSeconds > 0", () => {
    const project = createMockProject({ targetTimeSeconds: 3600 });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 120,
      subPieceRemaining: 0,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      reinitialize: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    expect(screen.getByTestId("target-label")).toBeInTheDocument();
    expect(screen.getByTestId("target-progress")).toBeInTheDocument();
    expect(screen.getByTestId("target-progress-fill")).toBeInTheDocument();
  });

  it("does not render target label when active project has targetTimeSeconds = 0", () => {
    const project = createMockProject({ targetTimeSeconds: 0 });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 120,
      subPieceRemaining: 0,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      reinitialize: vi.fn(),
      resetToZero: vi.fn(),
    });

    render(<TimerPanel />);

    expect(screen.queryByTestId("target-label")).not.toBeInTheDocument();
    expect(screen.queryByTestId("target-progress")).not.toBeInTheDocument();
  });

  it("renders ScheduleToast when a schedule is due", () => {
    const spyInfo = vi.spyOn(toast, "info").mockImplementation(() => "toast-id");

    const project = createMockProject({
      id: "proj-1",
      subPieces: [
        createMockSubPiece({ id: "sp-1", projectId: "proj-1" }),
      ],
    });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useScheduleWatcher.mockReturnValue({
      dueSchedule: {
        id: "due-s1",
        projectId: "proj-1",
        subPieceId: "sp-1",
        dayOfWeek: 1,
        startTime: "09:00",
        durationMinutes: 25,
        enabled: true,
        createdAt: Date.now(),
      },
    });

    render(<TimerPanel />);

    // ScheduleToast internally calls toast.info when dueSchedule is provided
    expect(spyInfo).toHaveBeenCalled();
    spyInfo.mockRestore();
  });

  it("shows normal timer UI when project elapsed is at or above target", () => {
    const project = createMockProject({ targetTimeSeconds: 600 });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 600,
      subPieceRemaining: 0,
      targetReached: true,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      reinitialize: vi.fn(),
      resetToZero: vi.fn(),
      restart: vi.fn(),
    });

    render(<TimerPanel />);

    // Target-reached card should no longer block the timer controls
    expect(screen.queryByText(/Target reached/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("timer-start")).toBeInTheDocument();
  });

  it("shows restart dialog when starting a completed project", () => {
    const startMock = vi.fn();
    const restartMock = vi.fn();
    const project = createMockProject({ status: "completed" });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 3600,
      subPieceRemaining: 0,
      targetReached: true,
      start: startMock,
      pause: vi.fn(),
      reset: vi.fn(),
      reinitialize: vi.fn(),
      resetToZero: vi.fn(),
      restart: restartMock,
    });

    render(<TimerPanel />);

    // Should show normal timer UI, not target-reached card
    expect(screen.queryByText(/Target reached/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("timer-start")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("timer-start"));

    expect(screen.getByText(/Project Completed/i)).toBeInTheDocument();
    expect(startMock).not.toHaveBeenCalled();
  });

  it("restarts a completed project and starts the timer when restart is confirmed", () => {
    const startMock = vi.fn();
    const restartMock = vi.fn();
    const project = createMockProject({ status: "completed" });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1", activeSubPieceId: null })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 3600,
      subPieceRemaining: 0,
      targetReached: true,
      start: startMock,
      pause: vi.fn(),
      reset: vi.fn(),
      reinitialize: vi.fn(),
      resetToZero: vi.fn(),
      restart: restartMock,
    });

    render(<TimerPanel />);

    fireEvent.click(screen.getByTestId("timer-start"));
    fireEvent.click(screen.getByRole("button", { name: /Restart/i }));

    expect(restartProjectMock).toHaveBeenCalledTimes(1);
    expect(restartProjectMock).toHaveBeenCalledWith("proj-1");
    expect(restartMock).toHaveBeenCalledTimes(1);
    expect(startMock).toHaveBeenCalledTimes(1);
  });
});
