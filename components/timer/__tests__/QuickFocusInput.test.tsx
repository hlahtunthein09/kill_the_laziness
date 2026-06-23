import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickFocusInput } from "../QuickFocusInput";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { DEFAULT_APP_SETTINGS } from "@/lib/constants";

describe("QuickFocusInput", () => {
  beforeEach(() => {
    useFocusStore.setState({
      projects: [],
      activeProjectId: null,
      settings: { ...DEFAULT_APP_SETTINGS },
      logs: [],
      hasHydrated: false,
    });
  });

  it("renders input and start button", () => {
    render(<QuickFocusInput />);
    expect(screen.getByTestId("quick-focus-input")).toBeInTheDocument();
    expect(screen.getByTestId("quick-focus-start")).toBeInTheDocument();
  });

  it("typing enables the start button", () => {
    render(<QuickFocusInput />);
    const input = screen.getByTestId("quick-focus-input");
    const button = screen.getByTestId("quick-focus-start");

    expect(button).toBeDisabled();
    fireEvent.change(input, { target: { value: "Read docs" } });
    expect(button).not.toBeDisabled();
  });

  it("submit creates a sub-piece under active project", () => {
    const project = useFocusStore.getState().addProject({
      name: "Active Project",
      description: "",
      color: "ocean",
      targetTimeSeconds: 3600,
    });
    useFocusStore.getState().setActiveProject(project.id);

    render(<QuickFocusInput />);
    const input = screen.getByTestId("quick-focus-input");
    const button = screen.getByTestId("quick-focus-start");

    fireEvent.change(input, { target: { value: "Write tests" } });
    fireEvent.click(button);

    const updated = useFocusStore.getState().getProjectById(project.id);
    expect(updated?.subPieces).toHaveLength(1);
    expect(updated?.subPieces[0].name).toBe("Write tests");
    expect(updated?.subPieces[0].allocatedMinutes).toBe(25);
    expect(updated?.subPieces[0].status).toBe("idle");
  });

  it("submit creates default project when no projects exist", () => {
    render(<QuickFocusInput />);
    const input = screen.getByTestId("quick-focus-input");
    const button = screen.getByTestId("quick-focus-start");

    fireEvent.change(input, { target: { value: "Quick task" } });
    fireEvent.click(button);

    const state = useFocusStore.getState();
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0].name).toBe("အထွေထွေ focus (General Focus)");
    expect(state.projects[0].subPieces).toHaveLength(1);
    expect(state.projects[0].subPieces[0].name).toBe("Quick task");
    expect(state.activeProjectId).toBe(state.projects[0].id);
  });

  it("empty input uses fallback task name", () => {
    render(<QuickFocusInput />);
    const input = screen.getByTestId("quick-focus-input");
    const button = screen.getByTestId("quick-focus-start");

    // Type something to enable button, then clear it
    fireEvent.change(input, { target: { value: "temp" } });
    fireEvent.change(input, { target: { value: "" } });
    // Button should be disabled again, so use form submit directly
    fireEvent.submit(input.closest("form")!);

    const state = useFocusStore.getState();
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0].subPieces[0].name).toBe(
      "အထွေထွေ focus (General Focus)"
    );
  });

  it("calls onStart after submit when provided", () => {
    const onStart = vi.fn();
    render(<QuickFocusInput onStart={onStart} />);
    const input = screen.getByTestId("quick-focus-input");
    const button = screen.getByTestId("quick-focus-start");

    fireEvent.change(input, { target: { value: "Focus task" } });
    fireEvent.click(button);

    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
