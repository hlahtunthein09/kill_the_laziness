import { describe, it, expect, beforeEach } from "vitest";
import {
  setSettingsBrowserInstance,
  setExtensionSettings,
  getExtensionSettings,
  getExtensionSettingsWithDefaults,
  type ExtensionSettings,
} from "../settingsSync";
import { DEFAULT_FORBIDDEN_URLS } from "../../../lib/constants";

function createMockBrowser(storage: Record<string, unknown> = {}) {
  return {
    storage: {
      local: {
        async set(items: Record<string, unknown>) {
          Object.assign(storage, items);
        },
        async get(keys: string | string[] | null) {
          if (keys === null || keys === undefined) return { ...storage };
          const keyList = Array.isArray(keys) ? keys : [keys];
          const result: Record<string, unknown> = {};
          for (const key of keyList) {
            if (key in storage) result[key] = storage[key];
          }
          return result;
        },
        async remove(keys: string | string[]) {
          const keyList = Array.isArray(keys) ? keys : [keys];
          for (const key of keyList) {
            delete storage[key];
          }
        },
      },
    },
  } as unknown as import("webextension-polyfill").Browser;
}

describe("settingsSync", () => {
  let mockStorage: Record<string, unknown>;

  beforeEach(() => {
    mockStorage = {};
    setSettingsBrowserInstance(createMockBrowser(mockStorage));
  });

  it("writes valid settings to storage", async () => {
    const settings: ExtensionSettings = {
      strictMode: true,
      forbiddenUrls: ["example.com"],
    };
    await setExtensionSettings(settings);
    expect(mockStorage["ff_extension_settings"]).toEqual(settings);
  });

  it("reads stored settings back", async () => {
    const settings: ExtensionSettings = {
      strictMode: false,
      forbiddenUrls: ["a.com", "b.com"],
    };
    await setExtensionSettings(settings);
    const result = await getExtensionSettings();
    expect(result).toEqual(settings);
  });

  it("returns null when no settings are stored", async () => {
    const result = await getExtensionSettings();
    expect(result).toBeNull();
  });

  it("fills missing fields with defaults", async () => {
    await setExtensionSettings({ strictMode: true });
    const result = await getExtensionSettingsWithDefaults();
    expect(result.strictMode).toBe(true);
    expect(result.forbiddenUrls).toEqual(DEFAULT_FORBIDDEN_URLS);
  });

  it("uses stored values when all fields are present", async () => {
    const customUrls = ["custom.com"];
    await setExtensionSettings({ strictMode: true, forbiddenUrls: customUrls });
    const result = await getExtensionSettingsWithDefaults();
    expect(result.strictMode).toBe(true);
    expect(result.forbiddenUrls).toEqual(customUrls);
  });

  it("rejects non-boolean strictMode", async () => {
    await expect(
      setExtensionSettings({ strictMode: "yes" as unknown as boolean })
    ).rejects.toThrow("strictMode must be a boolean");
  });

  it("rejects non-array forbiddenUrls", async () => {
    await expect(
      setExtensionSettings({ forbiddenUrls: "bad" as unknown as string[] })
    ).rejects.toThrow("forbiddenUrls must be an array");
  });

  it("rejects forbiddenUrls containing non-strings", async () => {
    await expect(
      setExtensionSettings({ forbiddenUrls: ["good.com", 123 as unknown as string] })
    ).rejects.toThrow("forbiddenUrls must contain only strings");
  });

  it("allows partial updates with only strictMode", async () => {
    await setExtensionSettings({ strictMode: false });
    const result = await getExtensionSettings();
    expect(result).toEqual({ strictMode: false });
  });

  it("allows partial updates with only forbiddenUrls", async () => {
    await setExtensionSettings({ forbiddenUrls: ["only.com"] });
    const result = await getExtensionSettings();
    expect(result).toEqual({ forbiddenUrls: ["only.com"] });
  });
});
