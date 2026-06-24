import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionSummary } from "../SessionSummary";

describe("SessionSummary", () => {
  const defaultProps = {
    projectName: "Build API",
    subPieceName: "Auth endpoints",
    elapsedSeconds: 1800,
    allocatedMinutes: 30,
    xpGained: 45,
  };

  it("renders Burmese header", () => {
    render(<SessionSummary {...defaultProps} />);
    expect(screen.getByText(/အချိန်ပြည့်/)).toBeInTheDocument();
  });

  it("renders English header", () => {
    render(<SessionSummary {...defaultProps} />);
    expect(screen.getByText(/Focus Session Complete/)).toBeInTheDocument();
  });

  it("shows project and sub-piece names", () => {
    render(<SessionSummary {...defaultProps} />);
    expect(screen.getByText(/Build API/)).toBeInTheDocument();
    expect(screen.getByText(/Auth endpoints/)).toBeInTheDocument();
  });

  it("shows formatted focused duration", () => {
    render(<SessionSummary {...defaultProps} />);
    expect(screen.getByText(/30m/)).toBeInTheDocument();
    expect(screen.getByText(/30m allocated/)).toBeInTheDocument();
  });

  it("shows XP gained", () => {
    render(<SessionSummary {...defaultProps} />);
    expect(screen.getByText(/XP gained: \+45/)).toBeInTheDocument();
  });
});
