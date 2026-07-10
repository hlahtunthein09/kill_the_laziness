import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { setSettingsBrowserInstance } from "../settingsSync";
import {
  setFocusSyncBrowserInstance,
  syncExtensionSettings,
} from "../focusSync";

const STORE_KEY = "ff_focus_store";

describe("focusSync.ts", () => {
  beforeEach(() => {
    setFocusSyncBrowserInstance(fakeBrowser);
    setSettingsBrowserInstance(fakeBrowser);
    fakeBrowser.reset();
    vi.spyOn(fakeBrowser.storage.local, "set").mockResolvedValue(undefined);
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("syncExtensionSettings", () => {
    it("reads ff_focus_store and writes settings to extension storage", async () => {
      const store = {
        state: {},
        settings: {
          strictMode: true,
          forbiddenUrls: ["youtube.com/shorts", "tiktok.com"],
        },
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(store));

      await syncExtensionSettings();

      expect(fakeBrowser.storage.local.set).toHaveBeenCalledTimes(1);
      expect(fakeBrowser.storage.local.set).toHaveBeenCalledWith({
        ff_extension_settings: {
          strictMode: true,
          forbiddenUrls: ["youtube.com/shorts", "tiktok.com"],
        },
      });
    });

    it("does not write settings when ff_focus_store is missing", async () => {
      await syncExtensionSettings();
      expect(fakeBrowser.storage.local.set).not.toHaveBeenCalled();
    });

    it("does not write settings when ff_focus_store is invalid JSON", async () => {
      localStorage.setItem(STORE_KEY, "not-json");
      await syncExtensionSettings();
      expect(fakeBrowser.storage.local.set).not.toHaveBeenCalled();
    });

    it("does not write settings when ff_focus_store has no settings key", async () => {
      localStorage.setItem(STORE_KEY, JSON.stringify({ state: {} }));
      await syncExtensionSettings();
      expect(fakeBrowser.storage.local.set).not.toHaveBeenCalled();
    });

    it("syncs partial settings (only strictMode)", async () => {
      const store = {
        state: {},
        settings: {
          strictMode: false,
        },
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(store));

      await syncExtensionSettings();

      expect(fakeBrowser.storage.local.set).toHaveBeenCalledTimes(1);
      expect(fakeBrowser.storage.local.set).toHaveBeenCalledWith({
        ff_extension_settings: {
          strictMode: false,
          forbiddenUrls: undefined,
        },
      });
    });

    it("filters out non-string values from forbiddenUrls", async () => {
      const store = {
        state: {},
        settings: {
          strictMode: true,
          forbiddenUrls: ["youtube.com/shorts", 123, null, "tiktok.com"],
        },
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(store));

      await syncExtensionSettings();

      expect(fakeBrowser.storage.local.set).toHaveBeenCalledTimes(1);
      expect(fakeBrowser.storage.local.set).toHaveBeenCalledWith({
        ff_extension_settings: {
          strictMode: true,
          forbiddenUrls: ["youtube.com/shorts", "tiktok.com"],
        },
      });
    });

    it("catches storage failure and does not throw", async () => {
      const store = {
        state: {},
        settings: {
          strictMode: true,
          forbiddenUrls: ["youtube.com/shorts"],
        },
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(store));

      fakeBrowser.storage.local.set = vi.fn().mockRejectedValue(
        new Error("Storage failure")
      );

      await expect(syncExtensionSettings()).resolves.toBeUndefined();
    });
  });
});
