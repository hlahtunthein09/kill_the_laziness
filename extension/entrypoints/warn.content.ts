/**
 * FocusFlow AI — Warn Mode Content Script
 *
 * Injected into forbidden URLs to show a calming overlay
 * when the user visits a distracting site in warn mode.
 */

import { defineContentScript } from "wxt/utils/define-content-script";
import { browser } from "wxt/browser";
import { isForbiddenUrl, DEFAULT_FORBIDDEN_PATTERNS } from "../lib/urlChecker";
import { getMotivation } from "../../lib/motivation";
import { injectWarnOverlay } from "../lib/warnOverlay";

const SETTINGS_KEY = "ff_extension_settings";

interface ExtensionSettings {
  strictMode?: boolean;
}

async function getExtensionSettings(): Promise<ExtensionSettings | null> {
  const result = await browser.storage.local.get(SETTINGS_KEY);
  return (result[SETTINGS_KEY] as ExtensionSettings | undefined) ?? null;
}

async function isStrictModeEnabled(): Promise<boolean> {
  const settings = await getExtensionSettings();
  // Default to false when no settings exist (warn mode by default in content script)
  if (!settings) return false;
  return settings.strictMode === true;
}

export default defineContentScript({
  matches: [
    "*://*.youtube.com/*",
    "*://*.instagram.com/*",
    "*://*.tiktok.com/*",
    "*://*.facebook.com/*",
    "*://*.twitter.com/*",
    "*://*.reddit.com/*",
    "*://*.netflix.com/*",
  ],
  main() {
    const url = window.location.href;

    // Only run on forbidden URLs
    if (!isForbiddenUrl(url, DEFAULT_FORBIDDEN_PATTERNS)) {
      return;
    }

    // Check strict mode; if enabled, background script handles redirect
    isStrictModeEnabled().then((strict) => {
      if (strict) {
        return;
      }

      // Warn mode: inject overlay with a struggling message
      const message = getMotivation({
        elapsedSeconds: 0,
        remainingSeconds: undefined,
        isRunning: false,
        completedToday: 0,
      });

      injectWarnOverlay({ my: message.my, en: message.en });
    });
  },
});
