/**
 * FocusFlow AI — Constants
 *
 * Storage keys, XP rules, level thresholds, and default configuration values.
 */

// ─── Storage Keys ──────────────────────────────────────────────────────────
export const FF_PROJECTS = 'ff_projects';
export const FF_ACTIVE_SESSION = 'ff_active_session';
export const FF_SETTINGS = 'ff_settings';
export const FF_LOGS = 'ff_logs';
export const FF_LAST_SYNC = 'ff_last_sync';

// ─── Default Forbidden URLs ──────────────────────────────────────────────────
export const DEFAULT_FORBIDDEN_URLS: string[] = [
  'youtube.com/shorts',
  'instagram.com/reels',
  'tiktok.com',
  'facebook.com/reels',
  'twitter.com',
  'reddit.com',
  'netflix.com',
];

// ─── XP Constants ──────────────────────────────────────────────────────────────
export const XP_PER_MINUTE = 5;
export const XP_SUB_PIECE_COMPLETE = 50;
export const XP_DISTRACTION_AVOIDED = 10;

// ─── Level Thresholds (cumulative XP required) ──────────────────────────────
// Level 1 starts at 0 XP. Each level requires progressively more XP.
export const LEVEL_THRESHOLDS: number[] = [
  0,      // Level 1
  200,    // Level 2
  500,    // Level 3
  900,    // Level 4
  1400,   // Level 5
  2000,   // Level 6
  2700,   // Level 7
  3500,   // Level 8
  4400,   // Level 9
  5500,   // Level 10
];

/**
 * Calculate the level for a given XP amount.
 * Returns the highest level whose threshold is <= the given XP.
 */
export function getLevelFromXp(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Get the XP needed to reach the next level from the current XP.
 * Returns 0 if already at max level.
 */
export function getXpToNextLevel(xp: number): number {
  const currentLevel = getLevelFromXp(xp);
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 0;
  }
  return LEVEL_THRESHOLDS[currentLevel] - xp;
}

// ─── Default Pomodoro Durations (in minutes) ─────────────────────────────────
export const DEFAULT_POMODORO_WORK_MINUTES = 25;
export const DEFAULT_POMODORO_SHORT_BREAK_MINUTES = 5;
export const DEFAULT_POMODORO_LONG_BREAK_MINUTES = 15;
export const DEFAULT_POMODORO_LONG_BREAK_INTERVAL = 4; // every N work sessions

// ─── Default App Settings ────────────────────────────────────────────────────
export const DEFAULT_APP_SETTINGS = {
  forbiddenUrls: DEFAULT_FORBIDDEN_URLS,
  strictMode: false,
  notificationsEnabled: true,
  theme: 'system' as const,
  dailyFocusGoalMinutes: 60,
  todayFocusSeconds: 0,
  lastFocusDate: '',
  currentStreak: 0,
  longestStreak: 0,
  lastStreakDate: '',
};
