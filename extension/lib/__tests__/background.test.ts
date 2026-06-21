import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { setBrowserInstance } from "../storage";
import { setAlarmBrowserInstance } from "../timerAlarm";
import { handleMessage } from "../messageHandler";
import type { ExtensionTimerState } from "../types";

describe("background.ts handleMessage", () => {
  beforeEach(() => {
    setBrowserInstance(fakeBrowser);
    setAlarmBrowserInstance(fakeBrowser);
    fakeBrowser.reset();
  });

  it("handles UPDATE_TIMER_STATE and stores valid payload", async () => {
    const payload: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: Date.now(),
    };

    const result = await handleMessage({ action: "UPDATE_TIMER_STATE", payload });

    expect(result).toEqual({ ok: true });

    // Verify it was stored
    const stored = await fakeBrowser.storage.local.get("ff_extension_timer");
    expect(stored["ff_extension_timer"]).toEqual(payload);
  });

  it("rejects UPDATE_TIMER_STATE with invalid payload", async () => {
    const invalidPayload = {
      projectId: 123,
      projectElapsed: "not-a-number",
    };

    const result = await handleMessage({
      action: "UPDATE_TIMER_STATE",
      payload: invalidPayload as unknown as ExtensionTimerState,
    });

    expect(result).toEqual({ ok: false, error: "Invalid timer state payload" });
  });

  it("returns null for GET_TIMER_STATE when nothing is stored", async () => {
    const result = await handleMessage({ action: "GET_TIMER_STATE" });

    expect(result).toBeNull();
  });

  it("returns stored state for GET_TIMER_STATE", async () => {
    const payload: ExtensionTimerState = {
      projectId: "proj-2",
      projectElapsed: 60,
      subPieceRemaining: 180,
      isRunning: false,
      savedAt: 1000,
    };

    await fakeBrowser.storage.local.set({ ff_extension_timer: payload });

    const result = await handleMessage({ action: "GET_TIMER_STATE" });

    expect(result).toEqual(payload);
  });

  it("returns error for unknown action", async () => {
    const result = await handleMessage({ action: "UNKNOWN_ACTION" } as unknown as {
      action: "UPDATE_TIMER_STATE";
      payload: ExtensionTimerState;
    });

    expect(result).toEqual({ ok: false, error: "Unknown action" });
  });
});
