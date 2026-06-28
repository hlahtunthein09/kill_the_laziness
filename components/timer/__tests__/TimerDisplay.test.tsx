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
  it("renders Burmese whole-project time label", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
      />
    );

    expect(
      screen.getByText(/ပရောဂျက်တစ်ခုလုံး၏ အချိန်/i)
    ).toBeInTheDocument();
  });

  it("renders sub-piece remaining label with name", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
        allocatedMinutes={25}
        subPieceName="Design UI"
      />
    );

    const label = screen.getByTestId("remaining-label")
    expect(label.textContent).toContain("Design UI")
    expect(label.textContent).toContain("အတွက် လက်ကျန် အချိန်")
    expect(label.textContent).toContain("Remaining")
  });

  it("does not render remaining label when allocatedMinutes is undefined", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
      />
    );

    expect(screen.queryByText(/Remaining/i)).not.toBeInTheDocument();
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
