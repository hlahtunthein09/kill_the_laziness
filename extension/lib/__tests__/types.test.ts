import { describe, it, expect } from "vitest";
import type { ExtensionTimerState } from "../types";

describe("ExtensionTimerState", () => {
  it("accepts baseline fields and round-trips through JSON", () => {
    const full: ExtensionTimerState = {
      projectId: "p1",
      subPieceId: "s1",
      projectName: "Project A",
      subPieceName: "Sub-piece A",
      projectElapsed: 60,
      subPieceRemaining: 300,
      targetTimeSeconds: 600,
      allocatedMinutes: 5,
      isRunning: true,
      savedAt: 1700000000000,
      schedules: [],
      projectElapsedBaseline: 0,
      subPieceRemainingBaseline: 300,
    };

    expect(JSON.parse(JSON.stringify(full))).toEqual(full);
  });
});
