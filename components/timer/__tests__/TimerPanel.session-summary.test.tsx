import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TimerPanel } from "../TimerPanel";
import { useFocusStore } from "@/lib/store/useFocusStore";
import type { Project, SubPiece } from "@/lib/types";
import { XP_PER_MINUTE, XP_SUB_PIECE_COMPLETE } from "@/lib/constants";
import React from "react";

// Mock the store
vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

// Mock sound utilities to avoid useFocusStore.getState() calls
vi.mock("@/lib/sound", () => ({
  playCompleteSound: vi.fn(),
  playMilestoneSound: vi.fn(),
}));

// Mock SubPieceForm to avoid store interactions
vi.mock("@/components/projects/SubPieceForm", () => ({
  SubPieceForm: function SubPieceFormMock({ onSubPieceAdded }: { onSubPieceAdded?: (id: string) => void }) {
    return React.createElement(
      "div",
      { "data-testid": "subpiece-form" },
      React.createElement(
        "button",
        {
          "data-testid": "mock-add-subpiece",
          onClick: () => onSubPieceAdded?.("new-sp-1"),
        },
        "Add SubPiece"
      )
    );
  },
}));

// Mock useTimer hook — captures the onComplete callback so tests can fire it
let mockOnComplete: (() => void) | undefined;
const _mockReset = vi.fn();
const _mockReinitialize = vi.fn();

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
      reinitialize: _mockReinitialize,
      resetToZero: vi.fn(),
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

describe("TimerPanel - CompletionDialog integration", () => {
  const mockReset = _mockReset;
  const mockReinitialize = _mockReinitialize;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReset.mockClear();
    mockReinitialize.mockClear();
    mockOnComplete = undefined;
  });

  it("renders CompletionDialog with project and sub-piece names when sub-piece completes", () => {
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

    // CompletionDialog should show project and sub-piece names
    // Use getAllByText since "Test Project" appears in both dialog and timer UI (portal renders both)
    expect(screen.getAllByText(/Test Project/)[0]).toBeInTheDocument();
    // SubPiece name appears in dialog description and info row - use getAllByText
    expect(screen.getAllByText(/Completed SubPiece/)[0]).toBeInTheDocument();
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

  it("renders CompletionDialog in project mode for project target completion when no sub-piece is completed", () => {
    // Project with NO completed sub-pieces — project-only or target-reached scenario
    const project = createMockProject({
      targetTimeSeconds: 3600,
      subPieces: [
        createMockSubPiece({
          id: "sp-1",
          name: "Idle SubPiece",
          status: "idle",
          elapsedSeconds: 0,
        }),
      ],
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

    // CompletionDialog in project mode should show project target title
    expect(screen.getByText(/ပရောဂျက်ပစ်မှတ် ရောက်ရှိ/)).toBeInTheDocument();
    expect(screen.getByText(/Project Target Reached/)).toBeInTheDocument();

    // Project name should be visible (appears in dialog description and info row)
    expect(screen.getAllByText(/Test Project/)[0]).toBeInTheDocument();

    // Continue and Back-to-projects buttons should be present
    expect(screen.getByText("Continue focusing")).toBeInTheDocument();
    expect(screen.getByText("Back to projects")).toBeInTheDocument();
  });

  it("shows project target XP based on elapsed time capped at target", () => {
    const targetSeconds = 3600; // 60 minutes
    const projectElapsed = 1800; // 30 minutes elapsed

    const project = createMockProject({
      targetTimeSeconds: targetSeconds,
      subPieces: [
        createMockSubPiece({
          id: "sp-1",
          name: "Idle SubPiece",
          status: "idle",
        }),
      ],
    });

    // Override useTimer to return specific projectElapsed
    // @ts-expect-error - mock return
    useTimer.mockImplementation((projectId, subPieceId, onComplete) => {
      mockOnComplete = onComplete;
      return {
        isRunning: false,
        projectElapsed: projectElapsed,
        subPieceRemaining: 0,
        start: vi.fn(),
        pause: vi.fn(),
        reset: _mockReset,
        reinitialize: _mockReinitialize,
        resetToZero: vi.fn(),
      };
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

    expect(mockOnComplete).toBeDefined();
    act(() => {
      mockOnComplete!();
    });

    // XP should be based on elapsed seconds (30 min = 30 XP at 1 XP/min)
    const expectedXp = Math.floor(projectElapsed / 60) * XP_PER_MINUTE;
    expect(screen.getByText(new RegExp(`XP gained: \\\+${expectedXp}`))).toBeInTheDocument();
  });

  it("clicking continue button on project target summary keeps project focus", () => {
    const setActiveProject = vi.fn();
    const project = createMockProject({
      subPieces: [
        createMockSubPiece({
          id: "sp-1",
          name: "Idle SubPiece",
          status: "idle",
        }),
      ],
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

    // Mock getState for setActiveProject
    const originalGetState = useFocusStore.getState;
    useFocusStore.getState = vi.fn(() => ({
      setActiveProject,
    })) as unknown as typeof useFocusStore.getState;

    render(<TimerPanel />);

    // Simulate completion via the onComplete callback
    expect(mockOnComplete).toBeDefined();
    act(() => {
      mockOnComplete!();
    });

    // Find and click the continue button
    const continueButton = screen.getByText("Continue focusing");
    expect(continueButton).toBeInTheDocument();

    fireEvent.click(continueButton);

    expect(setActiveProject).toHaveBeenCalledTimes(1);
    expect(setActiveProject).toHaveBeenCalledWith("proj-1");

    // Restore original getState
    useFocusStore.getState = originalGetState;
  });

  it("clicking 'Add another sub-piece' opens SubPieceForm and sets the new sub-piece active on add", () => {
    const setActiveSubPiece = vi.fn();
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
        activeSubPieceId: null,
        schedules: [],
        getNextDueSchedule: vi.fn(() => undefined),
      })
    );

    // Mock getState for setActiveSubPiece
    const originalGetState = useFocusStore.getState;
    useFocusStore.getState = vi.fn(() => ({
      setActiveSubPiece,
    })) as unknown as typeof useFocusStore.getState;

    const { rerender } = render(<TimerPanel />);

    // Simulate completion via the onComplete callback
    expect(mockOnComplete).toBeDefined();
    act(() => {
      mockOnComplete!();
    });

    // Click "Add another sub-piece" button
    const addButton = screen.getByText(/အခန်းကဏ္ဍအသစ်ထည့်ရန်/);
    fireEvent.click(addButton);

    // After clicking, the dialog closes (setShowSummary(false)) and SubPieceForm opens.
    // Since SubPieceForm is mocked, we just need to verify it renders after the state change.
    // Rerender to pick up the state change.
    rerender(<TimerPanel />);

    // SubPieceForm should be rendered (mocked) - it appears alongside the timer UI
    expect(screen.getByTestId("subpiece-form")).toBeInTheDocument();

    // Simulate the mocked SubPieceForm adding a new sub-piece
    const mockAddButton = screen.getByTestId("mock-add-subpiece");
    fireEvent.click(mockAddButton);

    expect(setActiveSubPiece).toHaveBeenCalledTimes(1);
    expect(setActiveSubPiece).toHaveBeenCalledWith("proj-1", "new-sp-1");

    // Restore original getState
    useFocusStore.getState = originalGetState;
  });

  it("clicking 'Continue focusing' refocuses the completed sub-piece and sets it active", () => {
    const refocusSubPiece = vi.fn();
    const setActiveSubPiece = vi.fn();
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
        activeSubPieceId: null,
        schedules: [],
        getNextDueSchedule: vi.fn(() => undefined),
      })
    );

    // Mock getState for store actions
    const originalGetState = useFocusStore.getState;
    useFocusStore.getState = vi.fn(() => ({
      refocusSubPiece,
      setActiveSubPiece,
    })) as unknown as typeof useFocusStore.getState;

    render(<TimerPanel />);

    // Simulate completion via the onComplete callback
    expect(mockOnComplete).toBeDefined();
    act(() => {
      mockOnComplete!();
    });

    // Click "Continue focusing" button
    const continueButton = screen.getByText(/Test Project ကို ဆက်လက်ပြီး focus လုပ်မယ်/);
    fireEvent.click(continueButton);

    expect(refocusSubPiece).toHaveBeenCalledTimes(1);
    expect(refocusSubPiece).toHaveBeenCalledWith("proj-1", "sp-1", 10);
    expect(setActiveSubPiece).toHaveBeenCalledTimes(1);
    expect(setActiveSubPiece).toHaveBeenCalledWith("proj-1", "sp-1");

    // Restore original getState
    useFocusStore.getState = originalGetState;
  });
});
