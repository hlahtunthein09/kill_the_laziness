"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";
import type { ActiveSessionToken } from "@/extension/lib/types";
import type { Browser } from "webextension-polyfill";

declare global {
  interface Window {
    browser?: Browser;
  }
}

const SESSION_KEY = "ff_active_session";
// NOTE: This localStorage key is only for web-app restore after a tab close/
// refresh. Extension sync is handled via window.browser.runtime.sendMessage and
// the authoritative extension state; this session snapshot is NOT sent to the
// extension and must not be used as a sync source.
const MAX_DRIFT_SECONDS = 60 * 60; // 60 minutes

interface SessionData {
  projectId: string;
  subPieceId?: string;
  projectName?: string;
  subPieceName?: string;
  projectElapsed: number;
  subPieceRemaining: number;
  projectElapsedBaseline: number;
  subPieceRemainingBaseline: number;
  savedAt: number;
  isRunning: boolean;
  targetTimeSeconds?: number;
  allocatedMinutes?: number;
}

interface UseTimerReturn {
  isRunning: boolean;
  projectElapsed: number;
  subPieceRemaining: number;
  targetReached: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  resetToZero: () => void;
  reinitialize: () => void;
  restart: () => void;
}

function readSession(
  projectId: string,
  subPieceId: string | undefined
): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: SessionData = JSON.parse(raw);
    if (
      session.projectId === projectId &&
      session.subPieceId === subPieceId
    ) {
      return session;
    }
  } catch {
    // ignore corrupt session data
  }
  return null;
}

interface TimerInit {
  isRunning: boolean;
  projectElapsed: number;
  subPieceRemaining: number;
  projectElapsedBaseline: number;
  subPieceRemainingBaseline: number;
  shouldAutoComplete: boolean;
  autoCompleteSeconds: number;
  targetReached: boolean;
}

function computeInit(
  projectId: string,
  subPieceId: string | undefined,
  initialProjectTime: number,
  initialSubPieceRemaining: number,
  targetTimeSeconds: number
): TimerInit {
  const session = readSession(projectId, subPieceId);
  if (!session) {
    const targetReached =
      targetTimeSeconds > 0 && initialProjectTime >= targetTimeSeconds;
    return {
      isRunning: false,
      projectElapsed: targetReached ? targetTimeSeconds : initialProjectTime,
      subPieceRemaining: initialSubPieceRemaining,
      projectElapsedBaseline: targetReached ? targetTimeSeconds : initialProjectTime,
      subPieceRemainingBaseline: initialSubPieceRemaining,
      shouldAutoComplete: false,
      autoCompleteSeconds: 0,
      targetReached,
    };
  }

  const rawDrift = session.isRunning
    ? Math.floor((Date.now() - session.savedAt) / 1000)
    : 0;
  const drift = session.isRunning ? Math.min(MAX_DRIFT_SECONDS, rawDrift) : 0;
  const driftWasCapped = session.isRunning && rawDrift > MAX_DRIFT_SECONDS;

  const subPieceRemaining = subPieceId
    ? Math.max(0, session.subPieceRemaining - (session.isRunning ? drift : 0))
    : 0;

  const shouldAutoComplete =
    session.isRunning &&
    !driftWasCapped &&
    subPieceId !== undefined &&
    session.subPieceRemaining > 0 &&
    subPieceRemaining === 0;

  const autoCompleteSeconds = shouldAutoComplete ? session.subPieceRemaining : 0;

  // Cap project elapsed when sub-piece auto-completes on restore
  const effectiveDrift = shouldAutoComplete ? session.subPieceRemaining : drift;
  const projectElapsedRaw =
    session.projectElapsed + (session.isRunning ? effectiveDrift : 0);
  const targetReached =
    targetTimeSeconds > 0 && projectElapsedRaw >= targetTimeSeconds;
  const projectElapsed = targetReached ? targetTimeSeconds : projectElapsedRaw;

  const isRunning =
    session.isRunning &&
    !driftWasCapped &&
    !shouldAutoComplete &&
    !targetReached &&
    (subPieceId ? subPieceRemaining > 0 : true);

  return {
    isRunning,
    projectElapsed,
    subPieceRemaining: subPieceId ? subPieceRemaining : initialSubPieceRemaining,
    projectElapsedBaseline: session.projectElapsedBaseline ?? session.projectElapsed,
    subPieceRemainingBaseline:
      session.subPieceRemainingBaseline ??
      (subPieceId ? session.subPieceRemaining : initialSubPieceRemaining),
    shouldAutoComplete,
    autoCompleteSeconds,
    targetReached,
  };
}

export function useTimer(
  projectId: string | undefined,
  subPieceId?: string,
  onComplete?: (completedSubPieceId?: string) => void
): UseTimerReturn {
  // Always call store selectors unconditionally to keep hook count stable.
  // When projectId is undefined, these lookups will return undefined safely.
  const project = useFocusStore((s) =>
    projectId ? s.getProjectById(projectId) : undefined
  );
  const subPiece = useFocusStore((s) =>
    projectId && subPieceId ? s.getSubPieceById(projectId, subPieceId) : undefined
  );

  const initialProjectTime = project?.totalTimeSeconds ?? 0;
  const targetTimeSeconds = project?.targetTimeSeconds ?? 0;
  const initialSubPieceRemaining = subPiece
    ? Math.max(0, subPiece.allocatedMinutes * 60 - subPiece.elapsedSeconds)
    : 0;

  // Compute initial state once via lazy useState initializer.
  // When projectId is undefined, computeInit is never called (lazy init),
  // but we still need a stable init value for the hook count.
  const [init] = useState<TimerInit>(() =>
    projectId
      ? computeInit(projectId, subPieceId, initialProjectTime, initialSubPieceRemaining, targetTimeSeconds)
      : {
          isRunning: false,
          projectElapsed: 0,
          subPieceRemaining: 0,
          projectElapsedBaseline: 0,
          subPieceRemainingBaseline: 0,
          shouldAutoComplete: false,
          autoCompleteSeconds: 0,
          targetReached: false,
        }
  );

  const [isRunning, setIsRunning] = useState(init.isRunning);
  const [projectElapsed, setProjectElapsed] = useState(init.projectElapsed);
  const [subPieceRemaining, setSubPieceRemaining] = useState(
    init.subPieceRemaining
  );
  const [targetReached, setTargetReached] = useState(init.targetReached);

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const lastPersistRef = useRef(0);
  const autoCompleteHandledRef = useRef(false);
  const projectTargetShownRef = useRef(false);
  const targetReachedRef = useRef(init.targetReached);
  const startedAtRef = useRef(Date.now());
  const resumedAtRef = useRef(Date.now());

  // Session baseline refs — track the values at session start so reset can
  // subtract elapsed deltas from the store and restore to baseline.
  const projectElapsedBaselineRef = useRef(init.projectElapsedBaseline);
  const subPieceRemainingBaselineRef = useRef(init.subPieceRemainingBaseline);
  const wasStartedRef = useRef(init.isRunning);
  const prevProjectIdRef = useRef(projectId);
  const prevSubPieceIdRef = useRef(subPieceId);

  // Store onComplete in a ref so the RAF loop can access the latest version
  // without adding it as a dependency.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Keep latest values in refs for the RAF loop (avoids stale closures)
  const projectElapsedRef = useRef(init.projectElapsed);
  const subPieceRemainingRef = useRef(init.subPieceRemaining);
  const isRunningRef = useRef(init.isRunning);
  const targetTimeSecondsRef = useRef(targetTimeSeconds);

  useEffect(() => { projectElapsedRef.current = projectElapsed; }, [projectElapsed]);
  useEffect(() => { subPieceRemainingRef.current = subPieceRemaining; }, [subPieceRemaining]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { targetTimeSecondsRef.current = targetTimeSeconds; }, [targetTimeSeconds]);
  useEffect(() => { targetReachedRef.current = targetReached; }, [targetReached]);

  // Reset the target-crossed notification when the project or target changes.
  useEffect(() => {
    projectTargetShownRef.current = false;
  }, [projectId, targetTimeSeconds]);

  // Update session baseline refs when projectId or subPieceId changes.
  useEffect(() => {
    if (projectId !== prevProjectIdRef.current || subPieceId !== prevSubPieceIdRef.current) {
      projectElapsedBaselineRef.current = projectElapsedRef.current;
      subPieceRemainingBaselineRef.current = subPieceRemainingRef.current;
      wasStartedRef.current = false;
      prevProjectIdRef.current = projectId;
      prevSubPieceIdRef.current = subPieceId;
    }
  }, [projectId, subPieceId]);

  // Auto-complete sub-piece on restore if drift brought it to zero
  useEffect(() => {
    if (projectId && init.shouldAutoComplete && subPieceId && !autoCompleteHandledRef.current) {
      autoCompleteHandledRef.current = true;
      const state = useFocusStore.getState();
      state.incrementProjectTime(projectId, init.autoCompleteSeconds);
      state.incrementSubPieceTime(projectId, subPieceId, init.autoCompleteSeconds);
      state.completeSubPiece(projectId, subPieceId);
      localStorage.removeItem(SESSION_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = useCallback(
    (running: boolean, projElapsed: number, spRemaining: number) => {
      if (!projectId) return;
      const sessionData: SessionData = {
        projectId,
        subPieceId,
        projectName: project?.name,
        subPieceName: subPiece?.name,
        projectElapsed: projElapsed,
        subPieceRemaining: spRemaining,
        projectElapsedBaseline: projectElapsedBaselineRef.current,
        subPieceRemainingBaseline: subPieceRemainingBaselineRef.current,
        savedAt: Date.now(),
        isRunning: running,
        targetTimeSeconds: project?.targetTimeSeconds ?? 0,
        allocatedMinutes: subPiece?.allocatedMinutes,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    },
    [projectId, subPieceId, project?.name, subPiece?.name, project?.targetTimeSeconds, subPiece?.allocatedMinutes]
  );

  // Keep the latest persistSession in a ref so tick can access it without
  // being a dependency (avoids stale closure and ESLint immutability issues).
  const persistSessionRef = useRef(persistSession);
  useEffect(() => {
    persistSessionRef.current = persistSession;
  }, [persistSession]);

  // Push display-sync events to the extension so the popup updates immediately
  // instead of waiting for the 5-second polling interval.
  function notifyDisplaySyncNeeded() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("ff:display-sync", { bubbles: true }));
  }

  async function sendExtensionCommand(
    type: "START_SESSION" | "RESUME_SESSION" | "PAUSE_SESSION" | "RESET_SESSION",
    isRunning = type === "START_SESSION" || type === "RESUME_SESSION"
  ) {
    if (typeof window === "undefined") return;
    const token = buildActiveSessionToken(isRunning);

    // In a real browser page window.browser is only available when the content
    // script injects it. Prefer the direct path; fall back to the ff:command
    // event bridge so the content script can forward the message.
    if (typeof window.browser !== "undefined") {
      try {
        await window.browser?.runtime?.sendMessage({ type, token });
        return;
      } catch {
        // extension not installed or context invalid; fall through to event bridge
      }
    }

    window.dispatchEvent(
      new CustomEvent("ff:command", {
        detail: { type, token },
        bubbles: true,
      })
    );
  }

  async function getActiveSessionFromExtension(): Promise<ActiveSessionToken | null> {
    if (typeof window === "undefined") return null;

    if (typeof window.browser !== "undefined") {
      try {
        const response = (await window.browser?.runtime?.sendMessage({
          type: "GET_ACTIVE_SESSION",
        })) as { ok: boolean; token?: ActiveSessionToken } | undefined;
        return response?.ok ? (response.token ?? null) : null;
      } catch {
        // fall through to event bridge
      }
    }

    return new Promise((resolve) => {
      const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail as
          | { requestId?: string; response?: { ok: boolean; token?: ActiveSessionToken } }
          | undefined;
        if (detail?.requestId === requestId) {
          window.removeEventListener("ff:response", handler);
          resolve(detail.response?.ok ? (detail.response.token ?? null) : null);
        }
      };
      window.addEventListener("ff:response", handler);
      window.dispatchEvent(
        new CustomEvent("ff:request", {
          detail: { requestId, type: "GET_ACTIVE_SESSION" },
          bubbles: true,
        })
      );
      setTimeout(() => {
        window.removeEventListener("ff:response", handler);
        resolve(null);
      }, 1000);
    });
  }

  function buildActiveSessionToken(isRunning: boolean): ActiveSessionToken {
    const mode = subPieceId ? "sub-piece" : "project";
    const targetTimeSeconds =
      mode === "sub-piece"
        ? (subPiece?.allocatedMinutes ?? 0) * 60
        : (project?.targetTimeSeconds ?? 0);

    return {
      sessionId: Math.random().toString(16).slice(2, 10).padEnd(8, "0"),
      projectId: projectId!,
      subPieceId,
      projectName: project?.name,
      subPieceName: subPiece?.name,
      mode,
      targetTimeSeconds,
      projectElapsedBaseline: projectElapsedBaselineRef.current,
      ...(subPieceId && {
        subPieceRemainingBaseline: subPieceRemainingBaselineRef.current,
      }),
      isRunning,
      startedAt: startedAtRef.current,
      resumedAt: resumedAtRef.current,
      elapsedActiveSeconds: projectElapsedRef.current - projectElapsedBaselineRef.current,
    };
  }

  // Keep the latest setters in refs so the RAF loop can call them without
  // creating stale closures.
  const setProjectElapsedRef = useRef(setProjectElapsed);
  const setSubPieceRemainingRef = useRef(setSubPieceRemaining);
  const setIsRunningRef = useRef(setIsRunning);
  const setTargetReachedRef = useRef(setTargetReached);
  useEffect(() => { setProjectElapsedRef.current = setProjectElapsed; }, []);
  useEffect(() => { setSubPieceRemainingRef.current = setSubPieceRemaining; }, []);
  useEffect(() => { setIsRunningRef.current = setIsRunning; }, []);
  useEffect(() => { setTargetReachedRef.current = setTargetReached; }, []);

  // Seed local display from the extension's authoritative state on mount.
  useEffect(() => {
    if (!projectId) return;

    async function seedFromExtension() {
      try {
        const token = await getActiveSessionFromExtension();
        if (!token) return;

        if (
          token.projectId !== projectId ||
          token.subPieceId !== subPieceId ||
          typeof token.projectElapsedBaseline !== "number" ||
          typeof token.targetTimeSeconds !== "number" ||
          typeof token.isRunning !== "boolean" ||
          typeof token.startedAt !== "number"
        ) {
          return;
        }

        const elapsedActive = token.isRunning
          ? Math.floor((Date.now() - token.resumedAt) / 1000) + token.elapsedActiveSeconds
          : token.elapsedActiveSeconds;
        const drift = token.isRunning ? Math.min(MAX_DRIFT_SECONDS, elapsedActive) : 0;
        const driftWasCapped = token.isRunning && elapsedActive > MAX_DRIFT_SECONDS;

        let nextProjectElapsed = token.projectElapsedBaseline + drift;
        let nextSubPieceRemaining = subPieceId
          ? Math.max(0, (token.subPieceRemainingBaseline ?? token.targetTimeSeconds) - drift)
          : 0;

        const targetReachedOnSeed =
          targetTimeSeconds > 0 && nextProjectElapsed >= targetTimeSeconds;
        if (targetReachedOnSeed) {
          nextProjectElapsed = targetTimeSeconds;
        }

        let nextIsRunning = token.isRunning && !driftWasCapped && !targetReachedOnSeed;
        if (subPieceId && nextSubPieceRemaining === 0) {
          nextIsRunning = false;
        }

        projectElapsedRef.current = nextProjectElapsed;
        setProjectElapsed(nextProjectElapsed);
        subPieceRemainingRef.current = nextSubPieceRemaining;
        setSubPieceRemaining(nextSubPieceRemaining);
        isRunningRef.current = nextIsRunning;
        setIsRunning(nextIsRunning);
        targetReachedRef.current = targetReachedOnSeed;
        setTargetReached(targetReachedOnSeed);
      } catch {
        // extension not installed or context invalid
      }
    }

    void seedFromExtension();
  }, [projectId, subPieceId, targetTimeSeconds, setProjectElapsed, setSubPieceRemaining, setIsRunning]);

  // RAF loop effect. tick is defined as a regular function inside the effect
  // so it can reference itself without ESLint "accessed before declaration" errors,
  // and all mutable values are read from refs to avoid stale closures.
  useEffect(() => {
    if (!isRunning) return;

    lastTickRef.current = null;

    function tick(now: number) {
      if (!projectId) return;

      if (lastTickRef.current === null) {
        lastTickRef.current = now;
      }

      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      accumulatedRef.current += delta;

      // Process whole seconds
      const secondsElapsed = Math.floor(accumulatedRef.current / 1000);
      if (secondsElapsed > 0) {
        const prevSubPieceRemaining = subPieceRemainingRef.current;
        const prevProjectElapsed = projectElapsedRef.current;

        const maxApplied = subPieceId ? prevSubPieceRemaining : secondsElapsed;
        const appliedSeconds = Math.min(secondsElapsed, maxApplied);

        const nextProjectElapsed = prevProjectElapsed + appliedSeconds;
        const nextSubPieceRemaining = subPieceId
          ? Math.max(0, prevSubPieceRemaining - appliedSeconds)
          : 0;

        accumulatedRef.current -= appliedSeconds * 1000;

        projectElapsedRef.current = nextProjectElapsed;
        setProjectElapsedRef.current(nextProjectElapsed);

        if (subPieceId) {
          subPieceRemainingRef.current = nextSubPieceRemaining;
          setSubPieceRemainingRef.current(nextSubPieceRemaining);
        }

        // Persist every 5 seconds (based on session-elapsed time)
        if (nextProjectElapsed - lastPersistRef.current >= 5) {
          lastPersistRef.current = nextProjectElapsed;
          persistSessionRef.current(true, nextProjectElapsed, subPieceRemainingRef.current);
          notifyDisplaySyncNeeded();
        }

        // Update store each accumulated second (only applied seconds)
        const state = useFocusStore.getState();
        if (appliedSeconds > 0) {
          state.incrementProjectTime(projectId, appliedSeconds);
          if (subPieceId) {
            state.incrementSubPieceTime(projectId, subPieceId, appliedSeconds);
          }
        }

        // Auto-complete sub-piece when it hits zero
        if (subPieceId && prevSubPieceRemaining > 0 && nextSubPieceRemaining === 0) {
          setIsRunningRef.current(false);
          isRunningRef.current = false;
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          lastTickRef.current = null;
          state.completeSubPiece(projectId, subPieceId);
          // Persist final completed state so the content script can read it
          persistSessionRef.current(false, nextProjectElapsed, 0);
          notifyDisplaySyncNeeded();
          void sendExtensionCommand("PAUSE_SESSION");
          localStorage.removeItem(SESSION_KEY);
          onCompleteRef.current?.(subPieceId);
          return;
        }

        // Auto-pause and mark target reached when project crosses its target
        if (
          targetTimeSecondsRef.current > 0 &&
          prevProjectElapsed < targetTimeSecondsRef.current &&
          nextProjectElapsed >= targetTimeSecondsRef.current
        ) {
          setIsRunningRef.current(false);
          isRunningRef.current = false;
          setTargetReachedRef.current(true);
          targetReachedRef.current = true;
          projectTargetShownRef.current = true;
          state.completeProject(projectId);
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          lastTickRef.current = null;
          // Persist final completed state so the content script can read it
          persistSessionRef.current(false, nextProjectElapsed, subPieceRemainingRef.current);
          notifyDisplaySyncNeeded();
          void sendExtensionCommand("PAUSE_SESSION");
          localStorage.removeItem(SESSION_KEY);
          onCompleteRef.current?.(undefined);
          return;
        }
      }

      if (isRunningRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, projectId, subPieceId]);

  const start = useCallback(() => {
    if (!projectId) return;
    if (subPieceId && subPieceRemainingRef.current <= 0) return;

    const isResume = wasStartedRef.current;

    // Set baseline on a real start (first time or after reset/restart/reinitialize).
    // On resume (pause -> start), preserve the existing baseline.
    if (!isResume) {
      projectElapsedBaselineRef.current = projectElapsedRef.current;
      subPieceRemainingBaselineRef.current = subPieceRemainingRef.current;
      startedAtRef.current = Date.now();
      wasStartedRef.current = true;
    }

    resumedAtRef.current = Date.now();
    setIsRunning(true);
    void sendExtensionCommand(isResume ? "RESUME_SESSION" : "START_SESSION");
  }, [projectId, subPieceId]);

  const pause = useCallback(() => {
    setIsRunning(false);
    lastTickRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    persistSession(false, projectElapsedRef.current, subPieceRemainingRef.current);
    notifyDisplaySyncNeeded();
    void sendExtensionCommand("PAUSE_SESSION");
  }, [persistSession]);

  const reset = useCallback(() => {
    setIsRunning(false);
    lastTickRef.current = null;
    accumulatedRef.current = 0;
    lastPersistRef.current = 0;
    projectTargetShownRef.current = false;
    setTargetReached(false);
    targetReachedRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!projectId) return;

    const projectDelta = projectElapsedRef.current - projectElapsedBaselineRef.current;
    const subPieceDelta = subPieceRemainingBaselineRef.current - subPieceRemainingRef.current;

    if (projectDelta > 0) {
      useFocusStore.getState().decrementProjectTime(projectId, projectDelta);
    }
    if (subPieceId && subPieceDelta > 0) {
      useFocusStore.getState().decrementSubPieceTime(projectId, subPieceId, subPieceDelta);
    }

    // For a fresh session, baseline is 0; reset restores display to 0.
    const baselineProjectElapsed = projectElapsedBaselineRef.current;
    const baselineSubPieceRemaining = subPieceRemainingBaselineRef.current;

    projectElapsedRef.current = baselineProjectElapsed;
    subPieceRemainingRef.current = baselineSubPieceRemaining;
    setProjectElapsed(baselineProjectElapsed);
    setSubPieceRemaining(baselineSubPieceRemaining);

    // Reset is a fresh session boundary; clear the started flag so the next
    // start re-establishes the baseline.
    wasStartedRef.current = false;

    localStorage.removeItem(SESSION_KEY);
    notifyDisplaySyncNeeded();
    void sendExtensionCommand("RESET_SESSION");
  }, [projectId, subPieceId]);

  const resetToZero = useCallback(() => {
    setIsRunning(false);
    lastTickRef.current = null;
    accumulatedRef.current = 0;
    lastPersistRef.current = 0;
    projectTargetShownRef.current = false;
    setTargetReached(false);
    targetReachedRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!projectId || !subPieceId) return;

    useFocusStore.getState().resetSubPieceTime(projectId, subPieceId);

    const updatedSubPiece = useFocusStore.getState().getSubPieceById(projectId, subPieceId);

    const newProjectElapsed = 0;
    const newSubPieceRemaining = updatedSubPiece
      ? Math.max(0, updatedSubPiece.allocatedMinutes * 60 - updatedSubPiece.elapsedSeconds)
      : 0;

    projectElapsedRef.current = newProjectElapsed;
    subPieceRemainingRef.current = newSubPieceRemaining;
    setProjectElapsed(newProjectElapsed);
    setSubPieceRemaining(newSubPieceRemaining);

    // Update session baselines so subsequent resets behave correctly
    projectElapsedBaselineRef.current = newProjectElapsed;
    subPieceRemainingBaselineRef.current = newSubPieceRemaining;
    wasStartedRef.current = false;

    localStorage.removeItem(SESSION_KEY);
  }, [projectId, subPieceId]);

  const reinitialize = useCallback(() => {
    setIsRunning(false);
    lastTickRef.current = null;
    accumulatedRef.current = 0;
    lastPersistRef.current = 0;
    setTargetReached(false);
    targetReachedRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Restore display to the session baseline (0 for a fresh session)
    const baselineProjectElapsed = projectElapsedBaselineRef.current;
    const baselineSubPieceRemaining = subPieceRemainingBaselineRef.current;

    projectElapsedRef.current = baselineProjectElapsed;
    subPieceRemainingRef.current = baselineSubPieceRemaining;
    setProjectElapsed(baselineProjectElapsed);
    setSubPieceRemaining(baselineSubPieceRemaining);

    // Reinitialize is a re-focus boundary; re-establish baselines from the
    // current display and clear the started flag.
    projectElapsedBaselineRef.current = baselineProjectElapsed;
    subPieceRemainingBaselineRef.current = baselineSubPieceRemaining;
    wasStartedRef.current = false;

    localStorage.removeItem(SESSION_KEY);
  }, []);

  const restart = useCallback(() => {
    if (!projectId) return;

    const refreshedProject = useFocusStore.getState().getProjectById(projectId);
    const refreshedSubPiece = subPieceId
      ? useFocusStore.getState().getSubPieceById(projectId, subPieceId)
      : undefined;

    const newProjectElapsed = refreshedProject?.totalTimeSeconds ?? 0;
    const newSubPieceRemaining = refreshedSubPiece
      ? Math.max(0, refreshedSubPiece.allocatedMinutes * 60 - refreshedSubPiece.elapsedSeconds)
      : 0;

    projectElapsedRef.current = newProjectElapsed;
    subPieceRemainingRef.current = newSubPieceRemaining;
    projectElapsedBaselineRef.current = newProjectElapsed;
    subPieceRemainingBaselineRef.current = newSubPieceRemaining;
    startedAtRef.current = Date.now();
    resumedAtRef.current = Date.now();
    wasStartedRef.current = false;

    setProjectElapsed(newProjectElapsed);
    setSubPieceRemaining(newSubPieceRemaining);
    setTargetReached(false);
    targetReachedRef.current = false;
    projectTargetShownRef.current = false;

    setIsRunning(false);
    isRunningRef.current = false;

    lastTickRef.current = null;
    accumulatedRef.current = 0;
    lastPersistRef.current = 0;
    localStorage.removeItem(SESSION_KEY);
    void sendExtensionCommand("START_SESSION", false);
  }, [projectId, subPieceId]);

  // When projectId is undefined, return neutral values and no-op handlers.
  // All hooks above are still called unconditionally, keeping hook count stable.
  if (projectId === undefined) {
    return {
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 0,
      targetReached: false,
      start: () => {},
      pause: () => {},
      reset: () => {},
      resetToZero: () => {},
      reinitialize: () => {},
      restart: () => {},
    };
  }

  return {
    isRunning,
    projectElapsed,
    subPieceRemaining,
    targetReached,
    start,
    pause,
    reset,
    resetToZero,
    reinitialize,
    restart,
  };
}
