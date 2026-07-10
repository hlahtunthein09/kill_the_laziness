import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  getActiveSession,
  setActiveSession,
  clearActiveSession,
  setSessionBrowserInstance,
} from "../sessionStorage";
import type { ActiveSessionToken } from "../types";

const token: ActiveSessionToken = {
  sessionId: "abc12345",
  projectId: "proj-1",
  subPieceId: "sub-1",
  projectName: "Test Project",
  subPieceName: "Test Sub-piece",
  mode: "sub-piece",
  targetTimeSeconds: 1500,
  projectElapsedBaseline: 300,
  subPieceRemainingBaseline: 1200,
  isRunning: true,
  startedAt: 1000,
  resumedAt: 2000,
  elapsedActiveSeconds: 0,
};

describe("sessionStorage", () => {
  beforeEach(() => {
    setSessionBrowserInstance(fakeBrowser as unknown as import("webextension-polyfill").Browser);
    fakeBrowser.reset();
  });

  it("returns null when no active session is stored", async () => {
    await expect(getActiveSession()).resolves.toBeNull();
  });

  it("round-trips an active session token", async () => {
    await setActiveSession(token);
    const retrieved = await getActiveSession();
    expect(retrieved).toEqual(token);
  });

  it("clears the stored session", async () => {
    await setActiveSession(token);
    await clearActiveSession();
    await expect(getActiveSession()).resolves.toBeNull();
  });
});
