"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";

const SESSION_KEY = "ff_active_session";

interface SessionData {
  projectId: string;
  subPieceId?: string;
  projectName?: string;
  subPieceName?: string;
  projectElapsed: number;
  subPieceRemaining: number;
  savedAt: number;
  isRunning: boolean;
}

interface UseTimerReturn {
  isRunning: boolean;
  projectElapsed: number;
  subPieceRemaining: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
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
}

function computeInit(
  projectId: string,
  subPieceId: string | undefined,
  initialProjectTime: number,
  initialSubPieceRemaining: number
): TimerInit {
  const session = readSession(projectId, subPieceId);
  if (!session) {
    return {
      isRunning: false,
      projectElapsed: initialProjectTime,
      subPieceRemaining: initialSubPieceRemaining,
      shouldAutoComplete: false,
      autoCompleteSeconds: 0,
    };
  }

  const drift = session.isRunning
    ? Math.floor((Date.now() - session.savedAt) / 1000)
    : 0;

  const subPieceRemaining = subPieceId
    ? Math.max(0, session.subPieceRemaining - (session.isRunning ? drift : 0))
    : 0;

  const shouldAutoComplete =
    session.isRunning &&
    subPieceId !== undefined &&
    session.subPieceRemaining > 0 &&
    subPieceRemaining === 0;

  const autoCompleteSeconds = shouldAutoComplete ? session.subPieceRemaining : 0;

  // Cap project elapsed when sub-piece auto-completes on restore
  const effectiveDrift = shouldAutoComplete ? session.subPieceRemaining : drift;
  const projectElapsed = session.projectElapsed + (session.isRunning ? effectiveDrift : 0);

  const isRunning =
    session.isRunning &&
    !shouldAutoComplete &&
    (subPieceId ? subPieceRemaining > 0 : true);

  return {
    isRunning,
    projectElapsed,
    subPieceRemaining: subPieceId ? subPieceRemaining : initialSubPieceRemaining,
    shouldAutoComplete,
    autoCompleteSeconds,
  };
}

export function useTimer(
  projectId: string | undefined,
  subPieceId?: string
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
  const initialSubPieceRemaining = subPiece
    ? Math.max(0, subPiece.allocatedMinutes * 60 - subPiece.elapsedSeconds)
    : 0;

  // Compute initial state once via lazy useState initializer.
  // When projectId is undefined, computeInit is never called (lazy init),
  // but we still need a stable init value for the hook count.
  const [init] = useState<TimerInit>(() =>
    projectId
      ? computeInit(projectId, subPieceId, initialProjectTime, initialSubPieceRemaining)
      : {
          isRunning: false,
          projectElapsed: 0,
          subPieceRemaining: 0,
          shouldAutoComplete: false,
          autoCompleteSeconds: 0,
        }
  );

  const [isRunning, setIsRunning] = useState(init.isRunning);
  const [projectElapsed, setProjectElapsed] = useState(init.projectElapsed);
  const [subPieceRemaining, setSubPieceRemaining] = useState(
    init.subPieceRemaining
  );

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const lastPersistRef = useRef(0);
  const initialProjectTimeRef = useRef(initialProjectTime);

  // Keep latest values in refs for the RAF loop (avoids stale closures)
  const projectElapsedRef = useRef(init.projectElapsed);
  const subPieceRemainingRef = useRef(init.subPieceRemaining);
  const isRunningRef = useRef(init.isRunning);

  useEffect(() => {
    if (!isRunning) {
      initialProjectTimeRef.current = initialProjectTime;
    }
  }, [initialProjectTime, isRunning]);

  useEffect(() => { projectElapsedRef.current = projectElapsed; }, [projectElapsed]);
  useEffect(() => { subPieceRemainingRef.current = subPieceRemaining; }, [subPieceRemaining]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  // Auto-complete sub-piece on restore if drift brought it to zero
  useEffect(() => {
    if (projectId && init.shouldAutoComplete && subPieceId) {
      const state = useFocusStore.getState();
      state.incrementProjectTime(projectId, init.autoCompleteSeconds);
      state.incrementSubPieceTime(projectId, subPieceId, init.autoCompleteSeconds);
      state.completeSubPiece(projectId, subPieceId);
      localStorage.removeItem(SESSION_KEY);
      // Mark as handled so we don't run again
      init.shouldAutoComplete = false;
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
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    },
    [projectId, subPieceId, project?.name, subPiece?.name]
  );

  const tick = useCallback(
    (now: number) => {
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
        accumulatedRef.current -= secondsElapsed * 1000;

        const prevSubPieceRemaining = subPieceRemainingRef.current;
        const nextProjectElapsed = projectElapsedRef.current + secondsElapsed;
        const nextSubPieceRemaining = subPieceId
          ? Math.max(0, prevSubPieceRemaining - secondsElapsed)
          : 0;

        projectElapsedRef.current = nextProjectElapsed;
        setProjectElapsed(nextProjectElapsed);

        if (subPieceId) {
          subPieceRemainingRef.current = nextSubPieceRemaining;
          setSubPieceRemaining(nextSubPieceRemaining);
        }

        // Persist every 5 seconds
        const totalElapsed = nextProjectElapsed - initialProjectTimeRef.current;
        if (totalElapsed - lastPersistRef.current >= 5) {
          lastPersistRef.current = totalElapsed;
          persistSession(true, nextProjectElapsed, subPieceRemainingRef.current);
        }

        // Update store each accumulated second
        const state = useFocusStore.getState();
        state.incrementProjectTime(projectId, secondsElapsed);
        if (subPieceId) {
          state.incrementSubPieceTime(projectId, subPieceId, secondsElapsed);
        }

        // Auto-complete sub-piece when it hits zero
        if (subPieceId && prevSubPieceRemaining > 0 && nextSubPieceRemaining === 0) {
          setIsRunning(false);
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          lastTickRef.current = null;
          useFocusStore
            .getState()
            .completeSubPiece(projectId, subPieceId);
          localStorage.removeItem(SESSION_KEY);
          return;
        }
      }

      if (isRunningRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [projectId, subPieceId, persistSession]
  );

  useEffect(() => {
    if (isRunning) {
      lastTickRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, tick]);

  const start = useCallback(() => {
    if (!projectId) return;
    if (subPieceId && subPieceRemainingRef.current <= 0) return;
    setIsRunning(true);
  }, [projectId, subPieceId]);

  const pause = useCallback(() => {
    setIsRunning(false);
    lastTickRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    persistSession(false, projectElapsedRef.current, subPieceRemainingRef.current);
  }, [persistSession]);

  const reset = useCallback(() => {
    setIsRunning(false);
    lastTickRef.current = null;
    accumulatedRef.current = 0;
    lastPersistRef.current = 0;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    projectElapsedRef.current = initialProjectTime;
    subPieceRemainingRef.current = Math.max(0, initialSubPieceRemaining);
    setProjectElapsed(initialProjectTime);
    setSubPieceRemaining(Math.max(0, initialSubPieceRemaining));
    localStorage.removeItem(SESSION_KEY);
  }, [initialProjectTime, initialSubPieceRemaining]);

  // When projectId is undefined, return neutral values and no-op handlers.
  // All hooks above are still called unconditionally, keeping hook count stable.
  if (projectId === undefined) {
    return {
      isRunning: false,
      projectElapsed: 0,
      subPieceRemaining: 0,
      start: () => {},
      pause: () => {},
      reset: () => {},
    };
  }

  return {
    isRunning,
    projectElapsed,
    subPieceRemaining,
    start,
    pause,
    reset,
  };
}
