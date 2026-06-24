/**
 * FocusFlow AI — Web App Control Listener Content Script
 *
 * Receives extension control messages (EXT_START_TIMER, etc.) and
 * dispatches custom DOM events into the web app page so the
 * dashboard timer can react to popup/background commands.
 */

import { defineContentScript } from "wxt/utils/define-content-script";
import type { Browser } from "webextension-polyfill";

let _browser: Browser | null = null;

export function setControlContentBrowserInstance(browser: Browser): void {
  _browser = browser;
}

function getBrowser(): Browser {
  if (!_browser) {
    // At runtime in the extension, wxt/browser is available.
    // In tests, the browser instance is injected via the setter.
    const { browser } = require("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

export function setupControlListener(): void {
  const browser = getBrowser();

  browser.runtime.onMessage.addListener((message: unknown) => {
    const msg = message as { action?: string };

    switch (msg.action) {
      case "EXT_START_TIMER": {
        window.dispatchEvent(new CustomEvent("ff:start", { bubbles: true }));
        break;
      }
      case "EXT_PAUSE_TIMER": {
        window.dispatchEvent(new CustomEvent("ff:pause", { bubbles: true }));
        break;
      }
      case "EXT_RESET_TIMER": {
        window.dispatchEvent(new CustomEvent("ff:reset", { bubbles: true }));
        break;
      }
      default: {
        // Unknown action — silently ignore
        break;
      }
    }
  });
}

export default defineContentScript({
  matches: ["http://localhost:3000/*"],
  main() {
    setupControlListener();
  },
});
