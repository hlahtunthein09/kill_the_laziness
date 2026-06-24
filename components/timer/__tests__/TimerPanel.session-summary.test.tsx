import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimerPanel } from "../TimerPanel";
import { useFocusStore } from "@/lib/store/useFocusStore";
import type { Project, SubPiece } from "@/lib/types";
import { XP_PER_MINUTE, XP_SUB_PIECE_COMPLETE } from "@/lib/constants";

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
    allocatedMinutes: 10,
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

describe("TimerPanel - SessionSummary integration", () => {
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockReset.mockClear();
  });

  it("renders SessionSummary with project and sub-piece names when sub-piece completes", () => {
    const completedSubPiece = createMockSubPiece({
      id: "sp-1",
      name: "Completed SubPiece",
      status: "completed",
      elapsedSeconds: 600,
      allocatedMinutes: 10,
    });

    const project = createMockProject({
      subPieces: [completedSubPiece],
    });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1" })
    );

    // Mock useTimer with subPieceRemaining: 0 (completed state)
    // The completion transition is detected when prev > 0 and current === 0
    // On first render, prevSubPieceRemainingRef starts at 0, so no transition.
    // We need to simulate a transition: first render with remaining > 0, then rerender with 0.
    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 600,
      subPieceRemaining: 10, // start with > 0
      start: vi.fn(),
      pause: vi.fn(),
      reset: mockReset,
    });

    const { rerender } = render(<TimerPanel />);

    // Now trigger the completion transition
    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 600,
      subPieceRemaining: 0, // now 0 -> triggers completion
      start: vi.fn(),
      pause: vi.fn(),
      reset: mockReset,
    });

    rerender(<TimerPanel />);

    // SessionSummary should show project and sub-piece names (combined as "Test Project — Completed SubPiece")
    expect(screen.getByText(/Test Project/)).toBeInTheDocument();
    expect(screen.getByText(/Completed SubPiece/)).toBeInTheDocument();
  });

  it("shows total XP including completion bonus", () => {
    const elapsedSeconds = 600; // 10 minutes
    const completedSubPiece = createMockSubPiece({
      id: "sp-1",
      name: "Completed SubPiece",
      status: "completed",
      elapsedSeconds,
      allocatedMinutes: 10,
    });

    const project = createMockProject({
      subPieces: [completedSubPiece],
    });

    const expectedXpPerMinute = Math.floor(elapsedSeconds / 60) * XP_PER_MINUTE;
    const expectedTotalXp = expectedXpPerMinute + XP_SUB_PIECE_COMPLETE;

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1" })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 600,
      subPieceRemaining: 5, // start with > 0
      start: vi.fn(),
      pause: vi.fn(),
      reset: mockReset,
    });

    const { rerender } = render(<TimerPanel />);

    // Trigger completion transition
    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 600,
      subPieceRemaining: 0,
      start: vi.fn(),
      pause: vi.fn(),
      reset: mockReset,
    });

    rerender(<TimerPanel />);

    expect(screen.getByText(new RegExp(`XP gained: \\\+${expectedTotalXp}`))).toBeInTheDocument();
  });

  it("clicking continue button calls reset and dismisses summary", () => {
    const completedSubPiece = createMockSubPiece({
      id: "sp-1",
      name: "Completed SubPiece",
      status: "completed",
      elapsedSeconds: 600,
      allocatedMinutes: 10,
    });

    const project = createMockProject({
      subPieces: [completedSubPiece],
    });

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({ projects: [project], activeProjectId: "proj-1" })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 600,
      subPieceRemaining: 5,
      start: vi.fn(),
      pause: vi.fn(),
      reset: mockReset,
    });

    const { rerender } = render(<TimerPanel />);

    // Trigger completion
    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 600,
      subPieceRemaining: 0,
      start: vi.fn(),
      pause: vi.fn(),
      reset: mockReset,
    });

    rerender(<TimerPanel />);

    // Find and click the continue button
    const continueButton = screen.getByText(/ဆက်လက်ပါ/);
    expect(continueButton).toBeInTheDocument();

    fireEvent.click(continueButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
