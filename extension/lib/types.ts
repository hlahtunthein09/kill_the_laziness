import type { FocusSessionSchedule } from "@/lib/types";

export interface ActiveSessionToken {
  sessionId: string;
  projectId: string;
  subPieceId?: string;
  projectName?: string;
  subPieceName?: string;
  mode: "sub-piece" | "project";
  targetTimeSeconds: number;
  projectElapsedBaseline: number;
  subPieceRemainingBaseline?: number;
  isRunning: boolean;
  startedAt: number;
  resumedAt: number;
  elapsedActiveSeconds: number;
}

export interface ExtensionTimerState {
  projectId: string;
  subPieceId?: string;
  projectName?: string;
  subPieceName?: string;
  projectElapsed: number;
  subPieceRemaining: number;
  targetTimeSeconds?: number;
  allocatedMinutes?: number; // needed for reset
  isRunning: boolean;
  savedAt: number;
  schedules?: FocusSessionSchedule[];
  projectElapsedBaseline?: number;
  subPieceRemainingBaseline?: number;
}
