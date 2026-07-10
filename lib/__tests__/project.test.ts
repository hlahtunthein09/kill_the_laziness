import { describe, it, expect } from "vitest";
import type { Project, SubPiece, PieceStatus } from "@/lib/types";
import { getRemainingTargetSeconds, doesSubPieceFit } from "@/lib/project";

const DEFAULT_STATUS: PieceStatus = "idle";

function makeProject(partial: Partial<Project> & Pick<Project, "targetTimeSeconds" | "totalTimeSeconds">): Project {
  return {
    id: "project-1",
    name: "Test Project",
    description: "",
    color: "mint",
    createdAt: 0,
    status: DEFAULT_STATUS,
    fortressLevel: 1,
    fortressHealth: 100,
    xp: 0,
    subPieces: [],
    ...partial,
  };
}

function makeSubPiece(partial: Partial<SubPiece> & Pick<SubPiece, "allocatedMinutes">): SubPiece {
  return {
    id: "sub-1",
    projectId: "project-1",
    name: "Test Sub-piece",
    elapsedSeconds: 0,
    status: DEFAULT_STATUS,
    order: 0,
    ...partial,
  };
}

describe("getRemainingTargetSeconds", () => {
  it("returns full target when no time has elapsed", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 0 });
    expect(getRemainingTargetSeconds(project)).toBe(3600);
  });

  it("returns remaining time when partially elapsed", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 3480 });
    expect(getRemainingTargetSeconds(project)).toBe(120);
  });

  it("returns zero when target is fully reached", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 3600 });
    expect(getRemainingTargetSeconds(project)).toBe(0);
  });

  it("clamps to zero when elapsed exceeds target", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 3900 });
    expect(getRemainingTargetSeconds(project)).toBe(0);
  });

  it("returns zero when target is zero", () => {
    const project = makeProject({ targetTimeSeconds: 0, totalTimeSeconds: 0 });
    expect(getRemainingTargetSeconds(project)).toBe(0);
  });
});

describe("doesSubPieceFit", () => {
  it("returns true when sub-piece exactly matches remaining target", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 3480 });
    const subPiece = makeSubPiece({ allocatedMinutes: 2 });
    expect(doesSubPieceFit(project, subPiece)).toBe(true);
  });

  it("returns true when sub-piece is smaller than remaining target", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 3480 });
    const subPiece = makeSubPiece({ allocatedMinutes: 1 });
    expect(doesSubPieceFit(project, subPiece)).toBe(true);
  });

  it("returns false when sub-piece exceeds remaining target", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 3480 });
    const subPiece = makeSubPiece({ allocatedMinutes: 5 });
    expect(doesSubPieceFit(project, subPiece)).toBe(false);
  });

  it("returns false when no target remains", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 3600 });
    const subPiece = makeSubPiece({ allocatedMinutes: 1 });
    expect(doesSubPieceFit(project, subPiece)).toBe(false);
  });

  it("returns false for any positive allocation when target is zero", () => {
    const project = makeProject({ targetTimeSeconds: 0, totalTimeSeconds: 0 });
    const subPiece = makeSubPiece({ allocatedMinutes: 1 });
    expect(doesSubPieceFit(project, subPiece)).toBe(false);
  });

  it("returns true for zero-minute sub-piece when target remains", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 0 });
    const subPiece = makeSubPiece({ allocatedMinutes: 0 });
    expect(doesSubPieceFit(project, subPiece)).toBe(true);
  });

  it("returns true for zero-minute sub-piece when target is zero", () => {
    const project = makeProject({ targetTimeSeconds: 0, totalTimeSeconds: 0 });
    const subPiece = makeSubPiece({ allocatedMinutes: 0 });
    expect(doesSubPieceFit(project, subPiece)).toBe(true);
  });

  it("returns true for zero-minute sub-piece when elapsed exceeds target", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 7200 });
    const subPiece = makeSubPiece({ allocatedMinutes: 0 });
    expect(doesSubPieceFit(project, subPiece)).toBe(true);
  });
});

describe("budget invariants", () => {
  it("never reports a negative remaining target", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 100_000 });
    expect(getRemainingTargetSeconds(project)).toBeGreaterThanOrEqual(0);
  });

  it("treats 1-second overrun as non-fitting", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 3541 });
    const subPiece = makeSubPiece({ allocatedMinutes: 1 });
    expect(doesSubPieceFit(project, subPiece)).toBe(false);
  });

  it("treats exact one-minute remaining as fitting", () => {
    const project = makeProject({ targetTimeSeconds: 3600, totalTimeSeconds: 3540 });
    const subPiece = makeSubPiece({ allocatedMinutes: 1 });
    expect(doesSubPieceFit(project, subPiece)).toBe(true);
  });
});
