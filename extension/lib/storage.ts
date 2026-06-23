import type { Browser } from "webextension-polyfill";
import type { ExtensionTimerState } from "./types";

const TIMER_STATE_KEY = "ff_extension_timer";
const MILESTONE_KEY = "ff_extension_last_milestone";

let _browser: Browser | null = null;

export function setBrowserInstance(browser: Browser): void {
  _browser = browser;
}

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    // In production, import from wxt/browser
    const { browser } = await import("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

export async function setTimerState(state: ExtensionTimerState): Promise<void> {
  const browser = await getBrowser();
  await browser.storage.local.set({ [TIMER_STATE_KEY]: state });
}

export async function getTimerState(): Promise<ExtensionTimerState | null> {
  const browser = await getBrowser();
  const result = await browser.storage.local.get(TIMER_STATE_KEY);
  return (result[TIMER_STATE_KEY] as ExtensionTimerState | undefined) ?? null;
}

export async function clearTimerState(): Promise<void> {
  const browser = await getBrowser();
  await browser.storage.local.remove(TIMER_STATE_KEY);
}

// --- Milestone helpers ---

export async function getLastMilestone(): Promise<number | null> {
  const browser = await getBrowser();
  const result = await browser.storage.local.get(MILESTONE_KEY);
  return (result[MILESTONE_KEY] as number | undefined) ?? null;
}

export async function setLastMilestone(milestone: number): Promise<void> {
  const browser = await getBrowser();
  await browser.storage.local.set({ [MILESTONE_KEY]: milestone });
}

export async function clearLastMilestone(): Promise<void> {
  const browser = await getBrowser();
  await browser.storage.local.remove(MILESTONE_KEY);
}
