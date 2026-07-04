import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  setControlContentBrowserInstance,
  setupControlListener,
} from "../../entrypoints/control.content";

describe("control.content.ts", () => {
  beforeEach(async () => {
    fakeBrowser.reset();
    setControlContentBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    vi.clearAllMocks();

    // Set location so the content script match pattern is satisfied
    window.location.href = "http://localhost:3000/timer";

    // Call the setup function to register the listener
    await setupControlListener();
  });

  it("dispatches ff:start when receiving EXT_START_TIMER", () => {
    const listener = vi.fn();
    window.addEventListener("ff:start", listener);

    fakeBrowser.runtime.onMessage.trigger(
      { action: "EXT_START_TIMER" },
      { id: "test-extension-id" } as any
    );

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe("ff:start");
    expect(event.bubbles).toBe(true);

    window.removeEventListener("ff:start", listener);
  });

  it("dispatches ff:pause when receiving EXT_PAUSE_TIMER", () => {
    const listener = vi.fn();
    window.addEventListener("ff:pause", listener);

    fakeBrowser.runtime.onMessage.trigger(
      { action: "EXT_PAUSE_TIMER" },
      { id: "test-extension-id" } as any
    );

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe("ff:pause");
    expect(event.bubbles).toBe(true);

    window.removeEventListener("ff:pause", listener);
  });

  it("dispatches ff:reset when receiving EXT_RESET_TIMER", () => {
    const listener = vi.fn();
    window.addEventListener("ff:reset", listener);

    fakeBrowser.runtime.onMessage.trigger(
      { action: "EXT_RESET_TIMER" },
      { id: "test-extension-id" } as any
    );

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe("ff:reset");
    expect(event.bubbles).toBe(true);

    window.removeEventListener("ff:reset", listener);
  });

  it("dispatches ff:state when receiving STATE_UPDATED", () => {
    const listener = vi.fn();
    window.addEventListener("ff:state", listener);

    const payload = {
      projectId: "proj-1",
      projectElapsed: 123,
      subPieceRemaining: 456,
      isRunning: true,
      savedAt: Date.now(),
    };

    fakeBrowser.runtime.onMessage.trigger(
      { action: "STATE_UPDATED", payload },
      { id: "test-extension-id" } as any
    );

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe("ff:state");
    expect(event.bubbles).toBe(true);
    expect(event.detail).toEqual(payload);

    window.removeEventListener("ff:state", listener);
  });

  it("forwards ff:command from web app to extension runtime", () => {
    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    window.dispatchEvent(
      new CustomEvent("ff:command", {
        detail: { action: "START_TIMER", payload: { projectId: "proj-1" } },
        bubbles: true,
      })
    );

    const matching = sendMessageMock.mock.calls.find(
      (call) =>
        call[0].action === "START_TIMER" && call[0].payload?.projectId === "proj-1"
    );
    expect(matching).toBeDefined();
  });

  it("forwards ff:command without payload when none provided", () => {
    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    window.dispatchEvent(
      new CustomEvent("ff:command", {
        detail: { action: "PAUSE_TIMER" },
        bubbles: true,
      })
    );

    const matching = sendMessageMock.mock.calls.find(
      (call) => call[0].action === "PAUSE_TIMER"
    );
    expect(matching).toBeDefined();
  });

  it("ignores ff:command with missing action", () => {
    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    window.dispatchEvent(
      new CustomEvent("ff:command", {
        detail: { payload: {} },
        bubbles: true,
      })
    );

    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it("ignores unknown actions", () => {
    const startListener = vi.fn();
    const pauseListener = vi.fn();
    const resetListener = vi.fn();
    window.addEventListener("ff:start", startListener);
    window.addEventListener("ff:pause", pauseListener);
    window.addEventListener("ff:reset", resetListener);

    fakeBrowser.runtime.onMessage.trigger(
      { action: "EXT_UNKNOWN" },
      { id: "test-extension-id" } as any
    );

    expect(startListener).not.toHaveBeenCalled();
    expect(pauseListener).not.toHaveBeenCalled();
    expect(resetListener).not.toHaveBeenCalled();

    window.removeEventListener("ff:start", startListener);
    window.removeEventListener("ff:pause", pauseListener);
    window.removeEventListener("ff:reset", resetListener);
  });
});
