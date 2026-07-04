"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";
import type { ExtensionTimerState } from "@/extension/lib/types";

const SESSION_KEY = "ff_active_session";
const MAX_DRIFT_SECONDS = 60 * 60; // 60 minutes

interface SessionData {
  projectId: string;
  subPieceId?: string;
  projectName?: string;
  subPieceName?: string;
  projectElapsed: number;
  subPieceRemaining: number;
  savedAt: number;
  isRunning: boolean;
  targetTimeSeconds?: number;
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
    shouldAutoComplete,
    autoCompleteSeconds,
    targetReached,
  };
}

export function useTimer(
  projectId: string | undefined,
  subPieceId?: string,
  onComplete?: () => void
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

  // Session baseline refs — track the values at session start so reset can
  // subtract elapsed deltas from the store and restore to baseline.
  const sessionStartProjectElapsedRef = useRef(init.projectElapsed);
  const sessionStartSubPieceRemainingRef = useRef(init.subPieceRemaining);
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
      sessionStartProjectElapsedRef.current = projectElapsedRef.current;
      sessionStartSubPieceRemainingRef.current = subPieceRemainingRef.current;
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
        savedAt: Date.now(),
        isRunning: running,
        targetTimeSeconds: project?.targetTimeSeconds ?? 0,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    },
    [projectId, subPieceId, project?.name, subPiece?.name, project?.targetTimeSeconds]
  );

  // Keep the latest persistSession in a ref so tick can access it without
  // being a dependency (avoids stale closure and ESLint immutability issues).
  const persistSessionRef = useRef(persistSession);
  useEffect(() => {
    persistSessionRef.current = persistSession;
  }, [persistSession]);

  function buildExtensionState(
    running: boolean,
    projElapsed: number,
    spRemaining: number
  ): ExtensionTimerState {
    return {
      projectId: projectId!,
      subPieceId,
      projectName: project?.name,
      subPieceName: subPiece?.name,
      projectElapsed: projElapsed,
      subPieceRemaining: spRemaining,
      targetTimeSeconds: project?.targetTimeSeconds ?? 0,
      allocatedMinutes: subPiece?.allocatedMinutes,
      isRunning: running,
      savedAt: Date.now(),
    };
  }

  async function sendExtensionRequest(action: string, payload?: unknown): Promise<unknown> {
    if (typeof window === "undefined") return undefined;

    return new Promise((resolve) => {
      const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail as
          | { requestId?: string; response?: unknown }
          | undefined;
        if (detail?.requestId === requestId) {
          window.removeEventListener("ff:response", handler);
          resolve(detail.response);
        }
      };

      window.addEventListener("ff:response", handler);
      window.dispatchEvent(
        new CustomEvent("ff:request", {
          detail: { requestId, action, payload },
          bubbles: true,
        })
      );

      // Clean up if the extension never responds.
      setTimeout(() => {
        window.removeEventListener("ff:response", handler);
        resolve(undefined);
      }, 1000);
    });
  }

  async function sendTimerCommand(
    action: "START_TIMER" | "PAUSE_TIMER" | "RESET_TIMER",
    state?: ExtensionTimerState
  ) {
    try {
      if (typeof window === "undefined") return;
      const detail = state !== undefined ? { action, payload: state } : { action };
      window.dispatchEvent(new CustomEvent("ff:command", { detail, bubbles: true }));
    } catch {
      // extension not installed or context invalid
    }
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
        const response = await sendExtensionRequest("GET_TIMER_STATE");
        if (!response || typeof response !== "object") return;

        const state = response as Partial<ExtensionTimerState>;
        if (
          typeof state.projectId !== "string" ||
          state.projectId !== projectId ||
          state.subPieceId !== subPieceId ||
          typeof state.projectElapsed !== "number" ||
          typeof state.subPieceRemaining !== "number" ||
          typeof state.isRunning !== "boolean" ||
          typeof state.savedAt !== "number"
        ) {
          return;
        }

        const rawDrift = state.isRunning
          ? Math.floor((Date.now() - state.savedAt) / 1000)
          : 0;
        const drift = state.isRunning ? Math.min(MAX_DRIFT_SECONDS, rawDrift) : 0;
        const driftWasCapped = state.isRunning && rawDrift > MAX_DRIFT_SECONDS;

        let nextProjectElapsed = state.projectElapsed + drift;
        let nextSubPieceRemaining = subPieceId
          ? Math.max(0, state.subPieceRemaining - drift)
          : 0;

        const targetReachedOnSeed =
          targetTimeSeconds > 0 && nextProjectElapsed >= targetTimeSeconds;
        if (targetReachedOnSeed) {
          nextProjectElapsed = targetTimeSeconds;
        }

        let nextIsRunning = state.isRunning && !driftWasCapped && !targetReachedOnSeed;
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
          localStorage.removeItem(SESSION_KEY);
          onCompleteRef.current?.();
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
          localStorage.removeItem(SESSION_KEY);
          onCompleteRef.current?.();
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
    setIsRunning(true);
    void sendTimerCommand(
      "START_TIMER",
      buildExtensionState(true, projectElapsedRef.current, subPieceRemainingRef.current)
    );
  }, [projectId, subPieceId]);

  const pause = useCallback(() => {
    setIsRunning(false);
    lastTickRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    persistSession(false, projectElapsedRef.current, subPieceRemainingRef.current);
    void sendTimerCommand("PAUSE_TIMER");
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

    const projectDelta = projectElapsedRef.current - sessionStartProjectElapsedRef.current;
    const subPieceDelta = sessionStartSubPieceRemainingRef.current - subPieceRemainingRef.current;

    if (projectDelta > 0) {
      useFocusStore.getState().decrementProjectTime(projectId, projectDelta);
    }
    if (subPieceId && subPieceDelta > 0) {
      useFocusStore.getState().decrementSubPieceTime(projectId, subPieceId, subPieceDelta);
    }

    // For a fresh session, baseline is 0; reset restores display to 0.
    const baselineProjectElapsed = sessionStartProjectElapsedRef.current;
    const baselineSubPieceRemaining = sessionStartSubPieceRemainingRef.current;

    projectElapsedRef.current = baselineProjectElapsed;
    subPieceRemainingRef.current = baselineSubPieceRemaining;
    setProjectElapsed(baselineProjectElapsed);
    setSubPieceRemaining(baselineSubPieceRemaining);
    localStorage.removeItem(SESSION_KEY);
    void sendTimerCommand("RESET_TIMER");
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
    sessionStartProjectElapsedRef.current = newProjectElapsed;
    sessionStartSubPieceRemainingRef.current = newSubPieceRemaining;

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
    const baselineProjectElapsed = sessionStartProjectElapsedRef.current;
    const baselineSubPieceRemaining = sessionStartSubPieceRemainingRef.current;

    projectElapsedRef.current = baselineProjectElapsed;
    subPieceRemainingRef.current = baselineSubPieceRemaining;
    setProjectElapsed(baselineProjectElapsed);
    setSubPieceRemaining(baselineSubPieceRemaining);
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
    sessionStartProjectElapsedRef.current = newProjectElapsed;
    sessionStartSubPieceRemainingRef.current = newSubPieceRemaining;

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
