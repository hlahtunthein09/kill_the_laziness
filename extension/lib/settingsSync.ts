import type { Browser } from "webextension-polyfill";
import { DEFAULT_FORBIDDEN_URLS } from "../../lib/constants";

export interface ExtensionSettings {
  strictMode?: boolean;
  forbiddenUrls?: string[];
}

const SETTINGS_KEY = "ff_extension_settings";

let _browser: Browser | null = null;

export function setSettingsBrowserInstance(browser: Browser): void {
  _browser = browser;
}

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    const { browser } = await import("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

function validateSettings(settings: ExtensionSettings): void {
  if (settings.strictMode !== undefined && typeof settings.strictMode !== "boolean") {
    throw new TypeError("strictMode must be a boolean");
  }
  if (settings.forbiddenUrls !== undefined) {
    if (!Array.isArray(settings.forbiddenUrls)) {
      throw new TypeError("forbiddenUrls must be an array");
    }
    if (settings.forbiddenUrls.some((u) => typeof u !== "string")) {
      throw new TypeError("forbiddenUrls must contain only strings");
    }
  }
}

export async function setExtensionSettings(settings: ExtensionSettings): Promise<void> {
  validateSettings(settings);
  const browser = await getBrowser();
  await browser.storage.local.set({ [SETTINGS_KEY]: settings });
}

export async function getExtensionSettings(): Promise<ExtensionSettings | null> {
  const browser = await getBrowser();
  const result = await browser.storage.local.get(SETTINGS_KEY);
  return (result[SETTINGS_KEY] as ExtensionSettings | undefined) ?? null;
}

export async function getExtensionSettingsWithDefaults(): Promise<Required<ExtensionSettings>> {
  const stored = await getExtensionSettings();
  return {
    strictMode: stored?.strictMode ?? false,
    forbiddenUrls: stored?.forbiddenUrls ?? [...DEFAULT_FORBIDDEN_URLS],
  };
}
