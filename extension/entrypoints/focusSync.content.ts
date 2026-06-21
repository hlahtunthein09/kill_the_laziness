/**
 * FocusFlow AI — Focus Sync Content Script
 *
 * Polls the web app's localStorage for ff_active_session and forwards
 * timer state to the extension background so off-screen notifications work.
 */

import { defineContentScript } from "wxt/utils/define-content-script";
import { startFocusSyncPolling } from "../lib/focusSync";

export default defineContentScript({
  // Add production domain match patterns here when deployed
  matches: ["http://localhost:3000/*"],
  main() {
    startFocusSyncPolling();
  },
});
