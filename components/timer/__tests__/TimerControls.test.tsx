import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimerControls } from "../TimerControls";

describe("TimerControls", () => {
  it("renders Start and Discard Session buttons when paused", () => {
    render(
      <TimerControls
        isRunning={false}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByTestId("timer-start")).toBeInTheDocument();
    expect(screen.getByTestId("timer-reset")).toBeInTheDocument();
    expect(screen.queryByTestId("timer-pause")).not.toBeInTheDocument();
  });

  it("renders Pause and Discard Session buttons when running", () => {
    render(
      <TimerControls
        isRunning={true}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByTestId("timer-pause")).toBeInTheDocument();
    expect(screen.getByTestId("timer-reset")).toBeInTheDocument();
    expect(screen.queryByTestId("timer-start")).not.toBeInTheDocument();
  });

  it("calls onStart when Start button is clicked", async () => {
    const onStart = vi.fn();
    render(
      <TimerControls
        isRunning={false}
        onStart={onStart}
        onPause={vi.fn()}
        onReset={vi.fn()}
      />
    );

    await userEvent.click(screen.getByTestId("timer-start"));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("calls onPause when Pause button is clicked", async () => {
    const onPause = vi.fn();
    render(
      <TimerControls
        isRunning={true}
        onStart={vi.fn()}
        onPause={onPause}
        onReset={vi.fn()}
      />
    );

    await userEvent.click(screen.getByTestId("timer-pause"));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("disables Start and Reset buttons when completed", async () => {
    const onStart = vi.fn();
    const onReset = vi.fn();
    render(
      <TimerControls
        isRunning={false}
        isCompleted={true}
        onStart={onStart}
        onPause={vi.fn()}
        onReset={onReset}
      />
    );

    expect(screen.getByTestId("timer-start")).toBeDisabled();
    expect(screen.getByTestId("timer-reset")).toBeDisabled();

    await userEvent.click(screen.getByTestId("timer-start"));
    await userEvent.click(screen.getByTestId("timer-reset"));
    expect(onStart).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
  });

  it("disables Pause and Reset buttons when running and completed", () => {
    render(
      <TimerControls
        isRunning={true}
        isCompleted={true}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByTestId("timer-pause")).toBeDisabled();
    expect(screen.getByTestId("timer-reset")).toBeDisabled();
  });
});
