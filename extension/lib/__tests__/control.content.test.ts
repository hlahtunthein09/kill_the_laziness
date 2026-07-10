import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  setControlContentBrowserInstance,
  setupControlListener,
} from "../../entrypoints/control.content";

let setupCalled = false;

describe("control.content.ts", () => {
  beforeEach(async () => {
    fakeBrowser.reset();
    setControlContentBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    vi.clearAllMocks();

    // Set location so the content script match pattern is satisfied
    window.location.href = "http://localhost:3000/timer";

    // Call the setup function to register the listener only once; DOM event
    // listeners otherwise accumulate across tests.
    if (!setupCalled) {
      await setupControlListener();
      setupCalled = true;
    }
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

  it("forwards ff:command events to browser.runtime.sendMessage", async () => {
    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    window.dispatchEvent(
      new CustomEvent("ff:command", {
        detail: { type: "START_SESSION", token: { projectId: "p1" } },
        bubbles: true,
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMock).toHaveBeenCalledWith({
      type: "START_SESSION",
      token: { projectId: "p1" },
    });
  });

  it("forwards ff:request events and dispatches ff:response", async () => {
    const sendMessageMock = vi.fn().mockResolvedValue({ ok: true, token: { projectId: "p1" } });
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    const responseListener = vi.fn();
    window.addEventListener("ff:response", responseListener);

    window.dispatchEvent(
      new CustomEvent("ff:request", {
        detail: { requestId: "req-1", type: "GET_ACTIVE_SESSION" },
        bubbles: true,
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMock).toHaveBeenCalledWith({ requestId: "req-1", type: "GET_ACTIVE_SESSION" });
    expect(responseListener).toHaveBeenCalledTimes(1);
    const event = responseListener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.requestId).toBe("req-1");
    expect(event.detail.response).toEqual({ ok: true, token: { projectId: "p1" } });

    window.removeEventListener("ff:response", responseListener);
  });

  it("ignores obsolete EXT_* actions and unknown actions", () => {
    const stateListener = vi.fn();
    const startListener = vi.fn();
    const pauseListener = vi.fn();
    const resetListener = vi.fn();
    window.addEventListener("ff:state", stateListener);
    window.addEventListener("ff:start", startListener);
    window.addEventListener("ff:pause", pauseListener);
    window.addEventListener("ff:reset", resetListener);

    fakeBrowser.runtime.onMessage.trigger(
      { action: "EXT_START_TIMER" },
      { id: "test-extension-id" } as any
    );
    fakeBrowser.runtime.onMessage.trigger(
      { action: "EXT_PAUSE_TIMER" },
      { id: "test-extension-id" } as any
    );
    fakeBrowser.runtime.onMessage.trigger(
      { action: "EXT_RESET_TIMER" },
      { id: "test-extension-id" } as any
    );
    fakeBrowser.runtime.onMessage.trigger(
      { action: "EXT_UNKNOWN" },
      { id: "test-extension-id" } as any
    );

    expect(stateListener).not.toHaveBeenCalled();
    expect(startListener).not.toHaveBeenCalled();
    expect(pauseListener).not.toHaveBeenCalled();
    expect(resetListener).not.toHaveBeenCalled();

    window.removeEventListener("ff:state", stateListener);
    window.removeEventListener("ff:start", startListener);
    window.removeEventListener("ff:pause", pauseListener);
    window.removeEventListener("ff:reset", resetListener);
  });
});
