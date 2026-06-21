import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  handleTabUpdate,
  isStrictModeEnabled,
  getForbiddenPatterns,
  setRedirectBrowserInstance,
} from "../redirect";
import { DEFAULT_FORBIDDEN_PATTERNS } from "../urlChecker";

describe("redirect.ts", () => {
  let updateCalls: Array<{ tabId: number; updateProperties: { url?: string } }>;
  let mockBrowser: typeof fakeBrowser;

  beforeEach(() => {
    updateCalls = [];
    fakeBrowser.reset();

    // Build a minimal mock browser that wraps fakeBrowser's storage but
    // overrides tabs.update and runtime.getURL to avoid fake-browser tab validation.
    mockBrowser = {
      ...fakeBrowser,
      runtime: {
        ...fakeBrowser.runtime,
        getURL: (path: string) => `chrome-extension://fake-id/${path}`,
      },
      tabs: {
        ...fakeBrowser.tabs,
        update: async (tabId: number | undefined, updateProperties: { url?: string }) => {
          updateCalls.push({ tabId: tabId ?? 0, updateProperties });
          return {} as Awaited<ReturnType<typeof fakeBrowser.tabs.update>>;
        },
      },
    } as unknown as typeof fakeBrowser;

    setRedirectBrowserInstance(mockBrowser as unknown as Parameters<typeof setRedirectBrowserInstance>[0]);
  });

  describe("isStrictModeEnabled", () => {
    it("defaults to true when no settings exist", async () => {
      const result = await isStrictModeEnabled();
      expect(result).toBe(true);
    });

    it("returns true when strictMode is explicitly true", async () => {
      await mockBrowser.storage.local.set({
        ff_extension_settings: { strictMode: true },
      });
      const result = await isStrictModeEnabled();
      expect(result).toBe(true);
    });

    it("returns false when strictMode is explicitly false", async () => {
      await mockBrowser.storage.local.set({
        ff_extension_settings: { strictMode: false },
      });
      const result = await isStrictModeEnabled();
      expect(result).toBe(false);
    });
  });

  describe("getForbiddenPatterns", () => {
    it("returns defaults when no settings exist", async () => {
      const result = await getForbiddenPatterns();
      expect(result).toEqual(DEFAULT_FORBIDDEN_PATTERNS);
    });

    it("returns custom patterns when configured", async () => {
      const custom = ["custom-site.com", "another-bad.com"];
      await mockBrowser.storage.local.set({
        ff_extension_settings: { forbiddenUrls: custom },
      });
      const result = await getForbiddenPatterns();
      expect(result).toEqual(custom);
    });
  });

  describe("handleTabUpdate", () => {
    it("redirects forbidden URL to blocked.html when strict mode is on", async () => {
      await mockBrowser.storage.local.set({
        ff_extension_settings: { strictMode: true },
      });

      await handleTabUpdate(42, { url: "https://youtube.com/shorts/abc123" });

      expect(updateCalls).toHaveLength(1);
      expect(updateCalls[0].tabId).toBe(42);
      expect(updateCalls[0].updateProperties.url).toContain("blocked.html");
    });

    it("does not redirect allowed URLs", async () => {
      await mockBrowser.storage.local.set({
        ff_extension_settings: { strictMode: true },
      });

      await handleTabUpdate(42, { url: "https://google.com" });

      expect(updateCalls).toHaveLength(0);
    });

    it("does not redirect when strict mode is off", async () => {
      await mockBrowser.storage.local.set({
        ff_extension_settings: { strictMode: false },
      });

      await handleTabUpdate(42, { url: "https://youtube.com/shorts/abc123" });

      expect(updateCalls).toHaveLength(0);
    });

    it("does nothing when changeInfo has no URL", async () => {
      await handleTabUpdate(42, { status: "loading" });

      expect(updateCalls).toHaveLength(0);
    });

    it("redirects multiple different forbidden URLs", async () => {
      await mockBrowser.storage.local.set({
        ff_extension_settings: { strictMode: true },
      });

      const forbiddenUrls = [
        "https://tiktok.com",
        "https://reddit.com/r/funny",
        "https://netflix.com/browse",
        "https://twitter.com/home",
        "https://instagram.com/reels",
        "https://facebook.com/reels",
      ];

      for (let i = 0; i < forbiddenUrls.length; i++) {
        await handleTabUpdate(i + 1, { url: forbiddenUrls[i] });
      }

      expect(updateCalls).toHaveLength(forbiddenUrls.length);
      for (let i = 0; i < forbiddenUrls.length; i++) {
        expect(updateCalls[i].tabId).toBe(i + 1);
        expect(updateCalls[i].updateProperties.url).toContain("blocked.html");
      }
    });

    it("does not redirect YouTube watch URLs (not Shorts)", async () => {
      await mockBrowser.storage.local.set({
        ff_extension_settings: { strictMode: true },
      });

      await handleTabUpdate(42, { url: "https://youtube.com/watch?v=abc123" });

      expect(updateCalls).toHaveLength(0);
    });
  });
});
