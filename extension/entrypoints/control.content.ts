/**
 * FocusFlow AI — Web App Control Listener Content Script
 *
 * Receives extension control messages (EXT_START_TIMER, etc.) and
 * dispatches custom DOM events into the web app page so the
 * dashboard timer can react to popup/background commands.
 */

import { defineContentScript } from "wxt/utils/define-content-script";
import type { Browser } from "webextension-polyfill";
import type { ExtensionTimerState } from "../lib/types";

let _browser: Browser | null = null;

export function setControlContentBrowserInstance(browser: Browser): void {
  _browser = browser;
}

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    // At runtime in the extension, wxt/browser is available via dynamic import.
    // In tests, the browser instance is injected via the setter.
    const { browser } = await import("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

export async function setupControlListener(): Promise<void> {
  const browser = await getBrowser();

  // Forward extension messages to the web app page as DOM events.
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
      case "STATE_UPDATED": {
        const payload = (msg as { action: string; payload?: ExtensionTimerState }).payload;
        window.dispatchEvent(
          new CustomEvent("ff:state", { detail: payload, bubbles: true })
        );
        break;
      }
      default: {
        // Unknown action — silently ignore
        break;
      }
    }
  });

  // Forward web-app commands to the extension background.
  window.addEventListener("ff:command", ((e: CustomEvent) => {
    const msg = e.detail as { action?: string; payload?: unknown };
    if (!msg || !msg.action) return;

    console.log("[control.content] ff:command received:", msg.action);

    // Send the command exactly as received (payload included when present).
    if (msg.payload !== undefined) {
      browser.runtime.sendMessage({ action: msg.action, payload: msg.payload }).catch(() => {
        // Extension context may be invalid; ignore.
      });
    } else {
      browser.runtime.sendMessage({ action: msg.action }).catch(() => {
        // Extension context may be invalid; ignore.
      });
    }
  }) as EventListener);

  // Forward web-app request/response pairs to the extension background.
  window.addEventListener("ff:request", ((e: CustomEvent) => {
    const request = e.detail as {
      requestId?: string;
      action?: string;
      payload?: unknown;
    };
    if (!request || typeof request.requestId !== "string" || !request.action) return;

    console.log("[control.content] ff:request received:", request.action, "requestId=", request.requestId);

    const message =
      request.payload !== undefined
        ? { action: request.action, payload: request.payload }
        : { action: request.action };

    browser.runtime
      .sendMessage(message)
      .then((response: unknown) => {
        window.dispatchEvent(
          new CustomEvent("ff:response", {
            detail: { requestId: request.requestId, response },
            bubbles: true,
          })
        );
      })
      .catch(() => {
        window.dispatchEvent(
          new CustomEvent("ff:response", {
            detail: { requestId: request.requestId, response: undefined },
            bubbles: true,
          })
        );
      });
  }) as EventListener);
}

export default defineContentScript({
  matches: ["http://localhost:3000/*"],
  async main() {
    await setupControlListener();
  },
});
