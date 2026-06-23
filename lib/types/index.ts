export type NatureColor = 'mint' | 'ocean' | 'sand' | 'forest' | 'coral';
export type PieceStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface SubPiece {
  id: string;
  projectId: string;
  name: string;
  allocatedMinutes: number;
  elapsedSeconds: number;
  status: PieceStatus;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: NatureColor;
  createdAt: number;
  totalTimeSeconds: number;
  targetTimeSeconds: number;
  status: PieceStatus;
  fortressLevel: number;
  fortressHealth: number;
  xp: number;
  subPieces: SubPiece[];
}

export interface AntiDistractionLog {
  id: string;
  timestamp: number;
  url: string;
  action: 'blocked' | 'warned';
  projectId: string;
}

export interface AppSettings {
  forbiddenUrls: string[];
  strictMode: boolean;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  dailyFocusGoalMinutes: number;
  todayFocusSeconds: number;
  lastFocusDate: string;
}

export interface FocusSession {
  id: string;
  projectId: string;
  subPieceId: string;
  startedAt: number;
  endedAt?: number;
  wasCompleted: boolean;
}

export interface TimerState {
  isRunning: boolean;
  projectElapsed: number;
  subPieceRemaining: number;
  sessionStartTime: number | null;
  lastTick: number | null;
  savedAt: number | null;
}
