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
  it("renders target label and progress bar when targetTimeSeconds is provided", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={true}
        targetTimeSeconds={3600}
      />
    );

    expect(screen.getByTestId("target-label")).toBeInTheDocument();
    expect(screen.getByTestId("target-label").textContent).toContain("Project အတွက်အချိန်");
    expect(screen.getByTestId("target-progress")).toBeInTheDocument();
    expect(screen.getByTestId("target-progress-fill")).toBeInTheDocument();
  });

  it("does not render target UI when targetTimeSeconds is undefined", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
      />
    );

    expect(screen.queryByTestId("target-label")).not.toBeInTheDocument();
    expect(screen.queryByTestId("target-progress")).not.toBeInTheDocument();
  });

  it("does not render target UI when targetTimeSeconds is 0", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
        targetTimeSeconds={0}
      />
    );

    expect(screen.queryByTestId("target-label")).not.toBeInTheDocument();
    expect(screen.queryByTestId("target-progress")).not.toBeInTheDocument();
  });

  it("progress fill width matches elapsed/target ratio", () => {
    render(
      <TimerDisplay
        projectElapsed={1800}
        subPieceRemaining={900}
        isRunning={true}
        targetTimeSeconds={3600}
      />
    );

    const fill = screen.getByTestId("target-progress-fill");
    expect(fill).toHaveStyle("width: 50%");
  });

  it("progress clamps at 100% when projectElapsed exceeds targetTimeSeconds", () => {
    render(
      <TimerDisplay
        projectElapsed={7200}
        subPieceRemaining={900}
        isRunning={true}
        targetTimeSeconds={3600}
      />
    );

    const fill = screen.getByTestId("target-progress-fill");
    expect(fill).toHaveStyle("width: 100%");
  });

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

  it("renders sub-piece elapsed label with name", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={1300}
        isRunning={false}
        allocatedMinutes={25}
        subPieceName="Design UI"
      />
    );

    const label = screen.getByTestId("subpiece-elapsed-label")
    expect(label.textContent).toContain("Design UI")
    expect(label.textContent).toContain("အတွက် အသုံးပြုပြီးအချိန်")
    expect(label.textContent).toContain("Elapsed")
  });

  it("does not render sub-piece section when allocatedMinutes is undefined", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={false}
      />
    );

    expect(screen.queryByTestId("subpiece-elapsed-label")).not.toBeInTheDocument();
    expect(screen.queryByTestId("subpiece-target-label")).not.toBeInTheDocument();
    expect(screen.queryByTestId("subpiece-elapsed-value")).not.toBeInTheDocument();
  });

  it("computes elapsed as allocated*60 - remaining", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={1300}
        isRunning={true}
        allocatedMinutes={25}
      />
    );

    const elapsedValue = screen.getByTestId("subpiece-elapsed-value");
    expect(elapsedValue.textContent).toBe("03:20");
  });

  it("shows target label with allocated time", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={1300}
        isRunning={true}
        allocatedMinutes={25}
      />
    );

    const targetLabel = screen.getByTestId("subpiece-target-label");
    expect(targetLabel.textContent).toContain("သတ်မှတ်ထားသော အချိန်");
    expect(targetLabel.textContent).toContain("25:00");
  });

  it("clamps elapsed at 0 when remaining exceeds allocated", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={2000}
        isRunning={true}
        allocatedMinutes={25}
      />
    );

    const elapsedValue = screen.getByTestId("subpiece-elapsed-value");
    expect(elapsedValue.textContent).toBe("00:00");
  });

  it("does not render old remaining-label testid", () => {
    render(
      <TimerDisplay
        projectElapsed={120}
        subPieceRemaining={900}
        isRunning={true}
        allocatedMinutes={25}
      />
    );

    expect(screen.queryByTestId("remaining-label")).not.toBeInTheDocument();
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
