import { describe, it, expect } from "vitest";
import { formatDuration, formatShortDuration } from "../time";

describe("formatDuration", () => {
  it("rounds fractional seconds down to whole seconds", () => {
    expect(formatDuration(17.999)).toBe("17s");
    expect(formatDuration(89.9)).toBe("1m 29s");
  });

  it("returns 0m for zero or negative input", () => {
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(-5)).toBe("0m");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(formatDuration(3665)).toBe("1h 1m");
    expect(formatDuration(185)).toBe("3m 5s");
    expect(formatDuration(45)).toBe("45s");
  });
});

describe("formatShortDuration", () => {
  it("formats MM:SS for sub-hour durations", () => {
    expect(formatShortDuration(185)).toBe("03:05");
  });

  it("formats HH:MM:SS for hour+ durations", () => {
    expect(formatShortDuration(3661)).toBe("1:01:01");
  });
});
