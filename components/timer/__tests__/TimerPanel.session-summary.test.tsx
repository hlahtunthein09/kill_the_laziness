import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TimerPanel } from "../TimerPanel";
import { useFocusStore } from "@/lib/store/useFocusStore";
import type { Project, SubPiece } from "@/lib/types";
import { XP_PER_MINUTE, XP_SUB_PIECE_COMPLETE } from "@/lib/constants";

// Mock the store
vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

// Mock sound utilities to avoid useFocusStore.getState() calls
vi.mock("@/lib/sound", () => ({
  playCompleteSound: vi.fn(),
  playMilestoneSound: vi.fn(),
}));

// Mock useTimer hook — captures the onComplete callback so tests can fire it
let mockOnComplete: (() => void) | undefined;
const _mockReset = vi.fn();

vi.mock("@/hooks/useTimer", () => ({
  useTimer: vi.fn((projectId, subPieceId, onComplete) => {
    mockOnComplete = onComplete;
    return {
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 0,
      start: vi.fn(),
      pause: vi.fn(),
      reset: _mockReset,
    };
  }),
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
  const mockReset = _mockReset;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReset.mockClear();
    mockOnComplete = undefined;
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
      selector({
        projects: [project],
        activeProjectId: "proj-1",
        schedules: [],
        getNextDueSchedule: vi.fn(() => undefined),
      })
    );

    render(<TimerPanel />);

    // Simulate completion via the onComplete callback from useTimer
    expect(mockOnComplete).toBeDefined();
    act(() => {
      mockOnComplete!();
    });

    // SessionSummary should show project and sub-piece names
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
      selector({
        projects: [project],
        activeProjectId: "proj-1",
        schedules: [],
        getNextDueSchedule: vi.fn(() => undefined),
      })
    );

    render(<TimerPanel />);

    // Simulate completion via the onComplete callback
    expect(mockOnComplete).toBeDefined();
    act(() => {
      mockOnComplete!();
    });

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
      selector({
        projects: [project],
        activeProjectId: "proj-1",
        schedules: [],
        getNextDueSchedule: vi.fn(() => undefined),
      })
    );

    render(<TimerPanel />);

    // Simulate completion via the onComplete callback
    expect(mockOnComplete).toBeDefined();
    act(() => {
      mockOnComplete!();
    });

    // Find and click the continue button
    const continueButton = screen.getByText(/ဆက်လက်ပါ/);
    expect(continueButton).toBeInTheDocument();

    fireEvent.click(continueButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
