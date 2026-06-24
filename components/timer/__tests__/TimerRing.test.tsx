import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimerRing } from "../TimerRing";

describe("TimerRing", () => {
  it("renders an svg element", () => {
    render(
      <TimerRing remainingSeconds={600} allocatedMinutes={10} />
    );
    expect(screen.getByTestId("timer-ring")).toBeInTheDocument();
  });

  it("full remaining time shows near-zero offset", () => {
    render(
      <TimerRing remainingSeconds={600} allocatedMinutes={10} />
    );
    const circles = screen.getByTestId("timer-ring").querySelectorAll("circle");
    const progressCircle = circles[1];
    const offset = progressCircle.getAttribute("stroke-dashoffset");
    expect(Number(offset)).toBeCloseTo(0, 1);
  });

  it("half remaining time shows half ring", () => {
    render(
      <TimerRing remainingSeconds={300} allocatedMinutes={10} />
    );
    const circles = screen.getByTestId("timer-ring").querySelectorAll("circle");
    const progressCircle = circles[1];
    const radius = (180 - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = progressCircle.getAttribute("stroke-dashoffset");
    expect(Number(offset)).toBeCloseTo(circumference / 2, 1);
  });

  it("zero remaining time shows full offset (empty ring)", () => {
    render(
      <TimerRing remainingSeconds={0} allocatedMinutes={10} />
    );
    const circles = screen.getByTestId("timer-ring").querySelectorAll("circle");
    const progressCircle = circles[1];
    const radius = (180 - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = progressCircle.getAttribute("stroke-dashoffset");
    expect(Number(offset)).toBeCloseTo(circumference, 1);
  });

  it("color is teal when > 50% remains", () => {
    render(
      <TimerRing remainingSeconds={301} allocatedMinutes={10} />
    );
    const svg = screen.getByTestId("timer-ring");
    expect(svg).toHaveClass("text-teal-500");
  });

  it("color is rose when <= 20% remains", () => {
    render(
      <TimerRing remainingSeconds={120} allocatedMinutes={10} />
    );
    const svg = screen.getByTestId("timer-ring");
    expect(svg).toHaveClass("text-rose-500");
  });

  it("custom size and strokeWidth are applied", () => {
    render(
      <TimerRing remainingSeconds={600} allocatedMinutes={10} size={240} strokeWidth={16} />
    );
    const svg = screen.getByTestId("timer-ring");
    expect(svg).toHaveAttribute("width", "240");
    expect(svg).toHaveAttribute("height", "240");

    const circles = svg.querySelectorAll("circle");
    expect(circles[0]).toHaveAttribute("stroke-width", "16");
    expect(circles[1]).toHaveAttribute("stroke-width", "16");
  });
});
