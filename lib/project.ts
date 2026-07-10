import type { Project, SubPiece } from "@/lib/types";

export function getRemainingTargetSeconds(project: Project): number {
  return Math.max(0, project.targetTimeSeconds - project.totalTimeSeconds);
}

export function doesSubPieceFit(project: Project, subPiece: SubPiece): boolean {
  const remainingSeconds = getRemainingTargetSeconds(project);
  return subPiece.allocatedMinutes * 60 <= remainingSeconds;
}
