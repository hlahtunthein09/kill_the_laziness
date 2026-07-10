/**
 * FocusFlow AI — Time Formatting Utilities
 *
 * All durations are stored in seconds internally.
 * Formatting functions convert to human-readable strings for display only.
 */

/**
 * Format seconds into a human-readable duration string.
 * Examples: 3600 → "1h", 4980 → "1h 23m", 2700 → "45m", 90 → "1m 30s"
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && hours === 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0m';
}

/**
 * Format seconds into a compact MM:SS or HH:MM:SS string.
 * Examples: 1500 → "25:00", 3661 → "1:01:01"
 */
export function formatShortDuration(seconds: number): string {
  if (seconds <= 0) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number): string => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * Format a timestamp into a locale-friendly time-of-day string.
 * Example: 1623456789000 → "2:30 PM"
 */
export function formatTimeOfDay(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
