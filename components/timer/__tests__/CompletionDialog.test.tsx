import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompletionDialog } from "../CompletionDialog";

describe("CompletionDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    projectName: "Test Project",
    subPieceName: "Test SubPiece",
    elapsedSeconds: 600,
    allocatedMinutes: 10,
    xpGained: 25,
    onAddSubPiece: vi.fn(),
    onContinueProject: vi.fn(),
  };

  it("renders dialog when open is true", () => {
    render(<CompletionDialog {...defaultProps} />);

    expect(screen.getByText(/အခန်းကဏ္ဍ ပြီးစီး/)).toBeInTheDocument();
    expect(screen.getByText(/Sub-piece Complete/)).toBeInTheDocument();
  });

  it("shows project name, sub-piece name, elapsed time, allocated time, and XP", () => {
    render(<CompletionDialog {...defaultProps} />);

    // Project and sub-piece names shown in description (DialogDescription) - use getAll since it also appears in info row
    const projectSubPieceElements = screen.getAllByText("Test Project — Test SubPiece");
    expect(projectSubPieceElements.length).toBeGreaterThanOrEqual(1);

    // Elapsed time and allocated minutes
    expect(screen.getByText(/Focused: 10m \/ 10m allocated/)).toBeInTheDocument();

    // XP gained
    expect(screen.getByText(/XP gained: \+25/)).toBeInTheDocument();
  });

  it("calls onAddSubPiece when Add button is clicked", () => {
    const onAddSubPiece = vi.fn();
    render(<CompletionDialog {...defaultProps} onAddSubPiece={onAddSubPiece} />);

    const addButton = screen.getByText(/အခန်းကဏ္ဍအသစ်ထည့်ရန်/);
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(onAddSubPiece).toHaveBeenCalledTimes(1);
  });

  it("calls onContinueProject when Continue button is clicked", () => {
    const onContinueProject = vi.fn();
    render(<CompletionDialog {...defaultProps} onContinueProject={onContinueProject} />);

    const continueButton = screen.getByText(/Test Project ကို ဆက်လက်ပြီး focus လုပ်မယ်/);
    expect(continueButton).toBeInTheDocument();

    fireEvent.click(continueButton);
    expect(onContinueProject).toHaveBeenCalledTimes(1);
  });

  describe("project mode", () => {
    const projectModeProps = {
      open: true,
      onOpenChange: vi.fn(),
      projectName: "My Project",
      elapsedSeconds: 1800,
      allocatedMinutes: 60,
      xpGained: 30,
      mode: "project" as const,
      onContinueProject: vi.fn(),
    };

    it("renders project target title", () => {
      render(<CompletionDialog {...projectModeProps} />);

      expect(screen.getByText(/ပရောဂျက်ပစ်မှတ် ရောက်ရှိ/)).toBeInTheDocument();
      expect(screen.getByText(/Project Target Reached/)).toBeInTheDocument();
    });

    it("shows project name without sub-piece label", () => {
      render(<CompletionDialog {...projectModeProps} />);

      // Project name appears in description and info row
      const projectElements = screen.getAllByText("My Project");
      expect(projectElements.length).toBeGreaterThanOrEqual(1);

      // No sub-piece separator should be present
      expect(screen.queryByText(/— Test SubPiece/)).not.toBeInTheDocument();
    });

    it("shows focused time and XP gained", () => {
      render(<CompletionDialog {...projectModeProps} />);

      expect(screen.getByText(/Focused: 30m \/ 60m allocated/)).toBeInTheDocument();
      expect(screen.getByText(/XP gained: \+30/)).toBeInTheDocument();
    });

    it("renders single 'continue' button that calls onContinueProject", () => {
      const onContinueProject = vi.fn();
      render(<CompletionDialog {...projectModeProps} onContinueProject={onContinueProject} />);

      // Single Burmese continue button
      const continueButton = screen.getByText("ဆက်လက်ပါ");
      expect(continueButton).toBeInTheDocument();

      // Sub-piece mode button should NOT be present
      expect(screen.queryByText(/အခန်းကဏ္ဍအသစ်ထည့်ရန်/)).not.toBeInTheDocument();

      fireEvent.click(continueButton);
      expect(onContinueProject).toHaveBeenCalledTimes(1);
    });

    it("falls back to closing dialog when onContinueProject is not provided", () => {
      const onOpenChange = vi.fn();
      render(<CompletionDialog {...projectModeProps} onOpenChange={onOpenChange} onContinueProject={undefined} />);

      const continueButton = screen.getByText("ဆက်လက်ပါ");
      fireEvent.click(continueButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
