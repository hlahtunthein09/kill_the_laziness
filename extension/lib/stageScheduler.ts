export type NotificationStage = "start" | "milestone" | "almostDone" | "complete";

export interface StageSchedule {
  allocatedSeconds: number;
  alarmPeriodSeconds: number;
  startTime: number;
  milestoneTimes: number[];
  almostTime: number;
  completeTime: number;
  // Legacy aliases kept for existing consumers until they migrate.
  milestones: number[];
  almostDone: number;
  complete: number;
}

function getAlarmPeriodSeconds(allocatedSeconds: number): number {
  if (allocatedSeconds <= 120) return 15;
  if (allocatedSeconds <= 900) return 30;
  return 60;
}

const BASE_DURATION_SECONDS = 60;
const ALPHA = 0.75;
const MAX_MILESTONES = 20;

export function getMilestoneCount(totalDurationSeconds: number): number {
  if (!Number.isFinite(totalDurationSeconds) || totalDurationSeconds <= 0) return 0;
  const ratio = totalDurationSeconds / BASE_DURATION_SECONDS + 1;
  const n = Math.floor(ALPHA * (Math.log(ratio) / Math.log(2))) + 1;
  return Math.min(MAX_MILESTONES, Math.max(1, n));
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function buildStageSchedule(totalDurationSeconds: number): StageSchedule {
  if (!Number.isFinite(totalDurationSeconds) || totalDurationSeconds <= 0) {
    return {
      allocatedSeconds: 0,
      alarmPeriodSeconds: 15,
      startTime: 0,
      milestoneTimes: [],
      almostTime: 0,
      completeTime: 0,
      milestones: [],
      almostDone: 0,
      complete: 0,
    };
  }

  const alarmPeriodSeconds = getAlarmPeriodSeconds(totalDurationSeconds);
  const milestoneCount = getMilestoneCount(totalDurationSeconds);

  const gap = 50 / (milestoneCount + 1);
  const milestoneTimes: number[] = [];
  for (let i = 1; i <= milestoneCount; i++) {
    const position = 25 + gap * i;
    const milestoneTime = totalDurationSeconds * (position / 100);
    milestoneTimes.push(round(milestoneTime));
  }

  const almostTime = round(totalDurationSeconds * 0.825);
  const completeTime = totalDurationSeconds;

  return {
    allocatedSeconds: totalDurationSeconds,
    alarmPeriodSeconds,
    startTime: 0,
    milestoneTimes,
    almostTime,
    completeTime,
    milestones: milestoneTimes,
    almostDone: almostTime,
    complete: completeTime,
  };
}
