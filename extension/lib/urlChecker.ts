/**
 * FocusFlow AI — URL Checker
 *
 * Checks if a URL matches any forbidden URL fragment pattern.
 * Used by the background service worker for tab monitoring.
 */

import { DEFAULT_FORBIDDEN_URLS } from "../../lib/constants";

export { DEFAULT_FORBIDDEN_URLS as DEFAULT_FORBIDDEN_PATTERNS };

/**
 * Check if a URL contains any forbidden pattern fragment.
 * Matches are case-insensitive and match against the full URL string.
 */
export function isForbiddenUrl(url: string, forbiddenPatterns: string[]): boolean {
  const lowerUrl = url.toLowerCase();
  return forbiddenPatterns.some((pattern) => lowerUrl.includes(pattern.toLowerCase()));
}
