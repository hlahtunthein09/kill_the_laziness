/**
 * FocusFlow AI — Extension State Broadcast Content Script
 *
 * Receives extension state broadcasts and mirrors them as DOM events
 * so the web app dashboard can stay in sync with the extension.
 */

import { defineContentScript } from "wxt/utils/define-content-script";
import type { Browser } from "webextension-polyfill";
import type { ExtensionTimerState } from "../lib/types";
import { APP_URL } from "../lib/config";


let _browser: Browser | null = null;

export function setControlContentBrowserInstance(browser: Browser): void {
  _browser = browser;
}

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    const { browser } = await import("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

export async function setupControlListener(): Promise<void> {
  const browser = await getBrowser();

  browser.runtime.onMessage.addListener((message: unknown) => {
    const msg = message as { action?: string };

    if (msg.action === "STATE_UPDATED") {
      const payload = (msg as { action: string; payload?: ExtensionTimerState }).payload;
      window.dispatchEvent(
        new CustomEvent("ff:state", { detail: payload, bubbles: true })
      );
    }
  });

  // Forward web-app commands to the extension background. The web app runs in
  // a regular page where window.browser is not available, so it dispatches DOM
  // events that this content script bridges to browser.runtime.sendMessage.
  window.addEventListener("ff:command", ((e: CustomEvent) => {
    const msg = e.detail as { type?: string; token?: unknown };
    if (!msg || !msg.type) return;
    browser.runtime.sendMessage(msg).catch(() => {
      // Extension context may be invalid; ignore.
    });
  }) as EventListener);

  window.addEventListener("ff:request", ((e: CustomEvent) => {
    const request = e.detail as {
      requestId?: string;
      type?: string;
      token?: unknown;
    };
    if (!request || typeof request.requestId !== "string" || !request.type) return;

    browser.runtime
      .sendMessage(request)
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
  matches: [`${APP_URL}/*`],
  async main() {
    await setupControlListener();
  },
});
