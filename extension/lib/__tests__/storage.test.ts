import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { setTimerState, getTimerState, clearTimerState, setBrowserInstance } from "../storage";
import type { ExtensionTimerState } from "../types";

describe("storage.ts", () => {
  beforeEach(() => {
    setBrowserInstance(fakeBrowser);
    fakeBrowser.reset();
  });

  it("returns null when no timer state is stored", async () => {
    const state = await getTimerState();
    expect(state).toBeNull();
  });

  it("stores and retrieves timer state", async () => {
    const testState: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: Date.now(),
    };

    await setTimerState(testState);
    const retrieved = await getTimerState();

    expect(retrieved).toEqual(testState);
  });

  it("overwrites existing timer state on set", async () => {
    const firstState: ExtensionTimerState = {
      projectId: "proj-1",
      projectElapsed: 60,
      subPieceRemaining: 600,
      isRunning: true,
      savedAt: 1000,
    };

    const secondState: ExtensionTimerState = {
      projectId: "proj-2",
      subPieceId: "sub-2",
      projectElapsed: 180,
      subPieceRemaining: 120,
      isRunning: false,
      savedAt: 2000,
    };

    await setTimerState(firstState);
    await setTimerState(secondState);
    const retrieved = await getTimerState();

    expect(retrieved).toEqual(secondState);
  });

  it("clears timer state", async () => {
    const testState: ExtensionTimerState = {
      projectId: "proj-1",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: Date.now(),
    };

    await setTimerState(testState);
    await clearTimerState();
    const retrieved = await getTimerState();

    expect(retrieved).toBeNull();
  });

  it("stores state without optional subPieceId", async () => {
    const testState: ExtensionTimerState = {
      projectId: "proj-1",
      projectElapsed: 0,
      subPieceRemaining: 0,
      isRunning: false,
      savedAt: Date.now(),
    };

    await setTimerState(testState);
    const retrieved = await getTimerState();

    expect(retrieved).toEqual(testState);
    expect(retrieved?.subPieceId).toBeUndefined();
  });
});
