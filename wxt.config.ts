import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "extension",
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
      matches: ["http://localhost:3000/*"],
    },
  },
});
