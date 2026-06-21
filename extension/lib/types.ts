export interface ExtensionTimerState {
  projectId: string;
  subPieceId?: string;
  projectName?: string;
  subPieceName?: string;
  projectElapsed: number;
  subPieceRemaining: number;
  isRunning: boolean;
  savedAt: number;
}
