import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  setControlContentBrowserInstance,
  setupControlListener,
} from "../../entrypoints/control.content";

describe("control.content.ts", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    setControlContentBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    vi.clearAllMocks();

    // Set location so the content script match pattern is satisfied
    window.location.href = "http://localhost:3000/timer";

    // Call the setup function to register the listener
    setupControlListener();
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
