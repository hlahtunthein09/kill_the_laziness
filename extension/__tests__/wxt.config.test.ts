import { describe, it, expect } from "vitest";
import config from "../../wxt.config";

const manifest = config.manifest as Record<string, unknown>;

describe("WXT extension config", () => {
  it("has the correct extension name and description", () => {
    expect(manifest.name).toBe("FocusFlow AI");
    expect(manifest.description).toBe(
      "Anti-distraction focus companion for FocusFlow AI"
    );
  });

  it("declares all required MV3 permissions", () => {
    const permissions = manifest.permissions as string[];
    expect(permissions).toEqual(
      expect.arrayContaining([
        "storage",
        "tabs",
        "alarms",
        "notifications",
        "scripting",
        "declarativeNetRequest",
      ])
    );
  });

  it("declares host permissions for forbidden distraction sites", () => {
    const hosts = manifest.host_permissions as string[];
    expect(hosts).toEqual(
      expect.arrayContaining([
        "*://*.youtube.com/*",
        "*://*.instagram.com/*",
        "*://*.tiktok.com/*",
        "*://*.facebook.com/*",
        "*://*.twitter.com/*",
        "*://*.reddit.com/*",
        "*://*.netflix.com/*",
      ])
    );
  });

  it("points srcDir to the extension folder", () => {
    expect(config.srcDir).toBe("extension");
  });
});
