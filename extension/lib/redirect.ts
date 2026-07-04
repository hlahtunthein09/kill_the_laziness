/**
 * FocusFlow AI — Background Tab Redirect
 *
 * Handles tab monitoring and redirecting forbidden URLs to the blocked page.
 * Exported as a standalone function for testability.
 */

import type { Browser } from "webextension-polyfill";
import { isForbiddenUrl, DEFAULT_FORBIDDEN_PATTERNS } from "./urlChecker";
import { notifyDistractionBlocked } from "./notifications";

const SETTINGS_KEY = "ff_extension_settings";
const BLOCKED_HTML_PATH = "blocked.html";

let _browser: Browser | null = null;

export function setRedirectBrowserInstance(browser: Browser): void {
  _browser = browser;
}

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    const { browser } = await import("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

export interface ExtensionSettings {
  strictMode?: boolean;
  forbiddenUrls?: string[];
}

async function getExtensionSettings(): Promise<ExtensionSettings | null> {
  const result = await (await getBrowser()).storage.local.get(SETTINGS_KEY);
  return (result[SETTINGS_KEY] as ExtensionSettings | undefined) ?? null;
}

/**
 * Check if strict mode is enabled. Defaults to true if settings are missing.
 */
export async function isStrictModeEnabled(): Promise<boolean> {
  const settings = await getExtensionSettings();
  // Default to true when no settings exist (strict by default)
  if (!settings) return true;
  return settings.strictMode !== false;
}

/**
 * Get the forbidden URL patterns. Falls back to defaults if not configured.
 */
export async function getForbiddenPatterns(): Promise<string[]> {
  const settings = await getExtensionSettings();
  return settings?.forbiddenUrls ?? DEFAULT_FORBIDDEN_PATTERNS;
}

/**
 * Handle a tab update event. If the URL is forbidden and strict mode is on,
 * redirect the tab to the blocked page.
 */
export async function handleTabUpdate(
  tabId: number,
  changeInfo: { status?: string; url?: string }
): Promise<void> {
  // Only process when we have a URL (loading or complete)
  if (!changeInfo.url) return;

  const strictMode = await isStrictModeEnabled();
  if (!strictMode) return;

  const patterns = await getForbiddenPatterns();
  if (!isForbiddenUrl(changeInfo.url, patterns)) return;

  const browser = await getBrowser();
  const blockedUrl = browser.runtime.getURL(BLOCKED_HTML_PATH);
  await browser.tabs.update(tabId, { url: blockedUrl });

  await notifyDistractionBlocked(browser, changeInfo.url);
}

/**
 * Log a distraction attempt to extension storage for analytics.
 */
export async function logDistractionAttempt(url: string): Promise<void> {
  const LOGS_KEY = "ff_distraction_logs";
  const result = await (await getBrowser()).storage.local.get(LOGS_KEY);
  const logs = (result[LOGS_KEY] as Array<{ url: string; timestamp: number; action: string }> | undefined) ?? [];

  logs.push({
    url,
    timestamp: Date.now(),
    action: "blocked",
  });

  await (await getBrowser()).storage.local.set({ [LOGS_KEY]: logs });
}
