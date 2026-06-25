import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { TimerPanel } from "../TimerPanel";
import { useFocusStore } from "@/lib/store/useFocusStore";
import type { Project, SubPiece } from "@/lib/types";

// Mock the store
vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

// Mock useTimer hook
vi.mock("@/hooks/useTimer", () => ({
  useTimer: vi.fn(() => ({
    isRunning: false,
    projectElapsed: 0,
    subPieceRemaining: 1500,
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

describe("TimerPanel extension controls", () => {
  const startMock = vi.fn();
  const pauseMock = vi.fn();
  const resetMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    startMock.mockClear();
    pauseMock.mockClear();
    resetMock.mockClear();

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        projects: [createMockProject()],
        activeProjectId: "proj-1",
        schedules: [],
        getNextDueSchedule: vi.fn(() => undefined),
      })
    );

    // @ts-expect-error - mock return
    useTimer.mockReturnValue({
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      start: startMock,
      pause: pauseMock,
      reset: resetMock,
    });
  });

  it("dispatched ff:start calls start()", () => {
    render(<TimerPanel />);

    window.dispatchEvent(new CustomEvent("ff:start"));

    expect(startMock).toHaveBeenCalledTimes(1);
  });

  it("dispatched ff:pause calls pause()", () => {
    render(<TimerPanel />);

    window.dispatchEvent(new CustomEvent("ff:pause"));

    expect(pauseMock).toHaveBeenCalledTimes(1);
  });

  it("dispatched ff:reset calls reset()", () => {
    render(<TimerPanel />);

    window.dispatchEvent(new CustomEvent("ff:reset"));

    expect(resetMock).toHaveBeenCalledTimes(1);
  });
});
