import { defineConfig } from "wxt";

const appUrl = process.env.WXT_APP_URL || "http://localhost:3000";

export default defineConfig({
  srcDir: "extension",
  publicDir: "extension/public",
  manifest: {
    name: "FocusFlow AI",
    description: "Anti-distraction focus companion for FocusFlow AI",
    permissions: [
      "storage",
      "tabs",
      "alarms",
      "notifications",
      "scripting",
      "declarativeNetRequest",
    ],
    host_permissions: [
      "*://*.youtube.com/*",
      "*://*.instagram.com/*",
      "*://*.tiktok.com/*",
      "*://*.facebook.com/*",
      "*://*.twitter.com/*",
      "*://*.reddit.com/*",
      "*://*.netflix.com/*",
    ],
    externally_connectable: {
      ids: [],
      matches: [`${appUrl}/*`],
    },
    web_accessible_resources: [
      {
        resources: ["blocked.html"],
        matches: ["<all_urls>"],
      },
    ],
    icons: {
      16: "/icon/16.png",
      32: "/icon/32.png",
      48: "/icon/48.png",
      128: "/icon/128.png",
    },
  },
});
