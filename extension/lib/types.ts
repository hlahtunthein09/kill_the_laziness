export interface ExtensionTimerState {
  projectId: string;
  subPieceId?: string;
  projectElapsed: number;
  subPieceRemaining: number;
  isRunning: boolean;
  savedAt: number;
}
