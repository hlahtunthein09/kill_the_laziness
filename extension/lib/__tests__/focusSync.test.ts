import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  setFocusSyncBrowserInstance,
  readFocusSession,
  syncFocusSession,
  resetFocusSync,
} from "../focusSync";
import type { ExtensionTimerState } from "../types";

const SESSION_KEY = "ff_active_session";

describe("focusSync.ts", () => {
  beforeEach(() => {
    setFocusSyncBrowserInstance(fakeBrowser);
    fakeBrowser.reset();
    localStorage.clear();
    resetFocusSync();
  });

  it("returns null when ff_active_session is absent", () => {
    const state = readFocusSession();
    expect(state).toBeNull();
  });

  it("returns null when ff_active_session is invalid JSON", () => {
    localStorage.setItem(SESSION_KEY, "not-json");
    const state = readFocusSession();
    expect(state).toBeNull();
  });

  it("returns null when ff_active_session is missing required fields", () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ projectId: "p1" }));
    const state = readFocusSession();
    expect(state).toBeNull();
  });

  it("parses and returns a valid ExtensionTimerState", () => {
    const session: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    const state = readFocusSession();
    expect(state).toEqual(session);
  });

  it("does not send UPDATE_TIMER_STATE when ff_active_session is absent", async () => {
    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    await syncFocusSession();

    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it("sends UPDATE_TIMER_STATE with parsed payload when session exists", async () => {
    const session: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    await syncFocusSession();

    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMock).toHaveBeenCalledWith({
      action: "UPDATE_TIMER_STATE",
      payload: session,
    });
  });

  it("sends UPDATE_TIMER_STATE with optional names preserved", async () => {
    const session: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectName: "My Project",
      subPieceName: "My Task",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    await syncFocusSession();

    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMock).toHaveBeenCalledWith({
      action: "UPDATE_TIMER_STATE",
      payload: session,
    });
  });

  it("does not send message twice for identical raw session (dedup)", async () => {
    const now = Date.now();
    const session: ExtensionTimerState = {
      projectId: "proj-1",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: now,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    await syncFocusSession();
    await syncFocusSession();

    expect(sendMessageMock).toHaveBeenCalledTimes(1);
  });

  it("sends a new message when the session changes", async () => {
    const session1: ExtensionTimerState = {
      projectId: "proj-1",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session1));

    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    await syncFocusSession();

    const session2: ExtensionTimerState = {
      ...session1,
      projectElapsed: 125,
      savedAt: Date.now() + 5000,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session2));

    await syncFocusSession();

    expect(sendMessageMock).toHaveBeenCalledTimes(2);
    expect(sendMessageMock).toHaveBeenLastCalledWith({
      action: "UPDATE_TIMER_STATE",
      payload: session2,
    });
  });

  it("ignores invalid JSON without throwing", async () => {
    localStorage.setItem(SESSION_KEY, "not-json");

    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    await expect(syncFocusSession()).resolves.toBeUndefined();
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it("catches sendMessage failure and does not throw", async () => {
    const session: ExtensionTimerState = {
      projectId: "proj-1",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    fakeBrowser.runtime.sendMessage = vi.fn().mockRejectedValue(
      new Error("Extension context invalidated")
    );

    await expect(syncFocusSession()).resolves.toBeUndefined();
  });

  it("resets dedup when session is cleared", async () => {
    const session: ExtensionTimerState = {
      projectId: "proj-1",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.runtime.sendMessage = sendMessageMock;

    await syncFocusSession();
    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    // Clear session
    localStorage.removeItem(SESSION_KEY);
    await syncFocusSession();
    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    // Set same session again — should send because _lastRawSession was reset
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    await syncFocusSession();
    expect(sendMessageMock).toHaveBeenCalledTimes(2);
  });
});
