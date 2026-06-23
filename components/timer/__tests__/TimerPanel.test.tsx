import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimerPanel } from "../TimerPanel";
import { useFocusStore } from "@/lib/store/useFocusStore";
import type { Project, SubPiece } from "@/lib/types";
import { mockPush } from "@/__mocks__/next-navigation";

// Mock the store
vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

// Mock useTimer hook
vi.mock("@/hooks/useTimer", () => ({
  useTimer: vi.fn(() => ({
    isRunning: false,
    projectElapsed: 0,
    subPieceRemaining: 0,
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
  })),
}));

import { useTimer } from "@/hooks/useTimer";

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
  });

  it("shows empty state when no active project", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [], activeProjectId: null })
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
      selector({ projects: [], activeProjectId: null })
    );

    render(<TimerPanel />);

    const ctaButton = screen.getByText(/ပရောဂျက်တစ်ခုရွေးချယ်ပါ/i);
    expect(ctaButton).toBeInTheDocument();

    fireEvent.click(ctaButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/projects");
  });

  it("shows empty state when active project has no incomplete sub-pieces", () => {
    const project = createMockProject({
      subPieces: [createMockSubPiece({ status: "completed" })],
    });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1" })
    );

    render(<TimerPanel />);

    expect(
      screen.getByText(/အခန်းကဏ္ဍများ မရှိသေးပါ/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No sub-pieces to focus on/i)
    ).toBeInTheDocument();
  });

  it("renders TimerDisplay and TimerControls when active project has an incomplete sub-piece", () => {
    const project = createMockProject();

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1" })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 120,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
    });

    render(<TimerPanel />);

    // Project name and sub-piece name should be visible
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Test SubPiece")).toBeInTheDocument();

    // Timer controls should be present
    expect(screen.getByTestId("timer-start")).toBeInTheDocument();
    expect(screen.getByTestId("timer-pause")).toBeInTheDocument();
    expect(screen.getByTestId("timer-reset")).toBeInTheDocument();

    // Timer display status badge should be present
    expect(screen.getByText(/Paused/i)).toBeInTheDocument();
  });

  it("shows running state when timer is active", () => {
    const project = createMockProject();

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1" })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: true,
      projectElapsed: 300,
      subPieceRemaining: 1200,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
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
      selector({ projects: [project], activeProjectId: "proj-1" })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
    });

    render(<TimerPanel />);

    // Should show the first incomplete sub-piece name
    expect(screen.getByText("Active SubPiece")).toBeInTheDocument();
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
      selector({ projects: [project], activeProjectId: "proj-1" })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
    });

    // This rerender must not throw a React hooks-order error
    rerender(<TimerPanel />);

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Test SubPiece")).toBeInTheDocument();
  });
});
