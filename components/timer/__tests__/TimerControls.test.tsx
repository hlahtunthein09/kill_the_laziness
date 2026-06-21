import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimerControls } from "../TimerControls";

describe("TimerControls", () => {
  it("renders Start, Pause, and Reset buttons", () => {
    render(
      <TimerControls
        isRunning={false}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByTestId("timer-start")).toBeInTheDocument();
    expect(screen.getByTestId("timer-pause")).toBeInTheDocument();
    expect(screen.getByTestId("timer-reset")).toBeInTheDocument();
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

  it("calls onReset when Reset button is clicked", async () => {
    const onReset = vi.fn();
    render(
      <TimerControls
        isRunning={false}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onReset={onReset}
      />
    );

    await userEvent.click(screen.getByTestId("timer-reset"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("disables Start when running", () => {
    render(
      <TimerControls
        isRunning={true}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByTestId("timer-start")).toBeDisabled();
    expect(screen.getByTestId("timer-pause")).not.toBeDisabled();
  });

  it("disables Pause when not running", () => {
    render(
      <TimerControls
        isRunning={false}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByTestId("timer-pause")).toBeDisabled();
    expect(screen.getByTestId("timer-start")).not.toBeDisabled();
  });
});
