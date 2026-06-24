import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimerDisplay } from "../TimerDisplay";

vi.mock("@/lib/time", () => ({
  formatDuration: (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  },
}));

describe("TimerDisplay", () => {
  it("renders Burmese project time label", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
      />
    );

    expect(
      screen.getByText(/ပရောဂျက် အချိန်/i)
    ).toBeInTheDocument();
  });

  it("renders English remaining label", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
      />
    );

    expect(
      screen.getByText(/Remaining/i)
    ).toBeInTheDocument();
  });

  it("renders TimerRing SVG when allocatedMinutes is provided", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
        allocatedMinutes={25}
      />
    );

    expect(screen.getByTestId("timer-ring")).toBeInTheDocument();
  });

  it("passes remaining time correctly to TimerRing", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
        allocatedMinutes={25}
      />
    );

    const ring = screen.getByTestId("timer-ring");
    // 900 seconds remaining out of 25*60 = 1500 total = 60% remaining
    // circumference = 2 * PI * ((220 - 12) / 2) = PI * 208 ~= 652.5
    // offset = circumference * (1 - 0.6) = circumference * 0.4
    const circles = ring.querySelectorAll("circle");
    const progressCircle = circles[1]; // second circle is the progress arc
    const dashoffset = progressCircle.getAttribute("stroke-dashoffset");
    expect(dashoffset).not.toBe("0");
    // At 60% remaining, offset should be ~40% of circumference
    const circumference = 2 * Math.PI * 104; // radius = (220-12)/2 = 104
    const expectedOffset = circumference * 0.4;
    expect(parseFloat(dashoffset!)).toBeCloseTo(expectedOffset, 0);
  });

  it("does not render ring when allocatedMinutes is 0", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
        allocatedMinutes={0}
      />
    );

    expect(screen.queryByTestId("timer-ring")).not.toBeInTheDocument();
  });

  it("does not render ring when allocatedMinutes is undefined", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
      />
    );

    expect(screen.queryByTestId("timer-ring")).not.toBeInTheDocument();
  });

  it("shows red text when subPieceRemaining is <= 60s and > 0", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={45}
        isRunning={true}
        allocatedMinutes={25}
      />
    );

    const remainingTime = screen.getByText("00:45");
    expect(remainingTime).toHaveClass("text-rose-600");
  });

  it("shows paused status badge when not running", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
        allocatedMinutes={25}
      />
    );

    expect(screen.getByText(/Paused/i)).toBeInTheDocument();
  });

  it("shows running status badge when running", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={true}
        allocatedMinutes={25}
      />
    );

    expect(screen.getByText(/Running/i)).toBeInTheDocument();
  });
});
