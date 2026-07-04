"use client";

import { useFocusStore } from "@/lib/store/useFocusStore";
import { useTimer } from "@/hooks/useTimer";
import { useScheduleWatcher } from "@/hooks/useScheduleWatcher";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { TimerToast } from "./TimerToast";
import { ScheduleToast } from "@/components/schedule/ScheduleToast";
import { CompletionDialog } from "./CompletionDialog";
import { SubPieceForm } from "@/components/projects/SubPieceForm";
import { ProjectCompletedDialog } from "@/components/projects/ProjectCompletedDialog";
import { FolderOpen } from "lucide-react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { MotivationContext } from "@/lib/motivation";
import { getMotivation } from "@/lib/motivation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ExtensionTimerState } from "@/extension/lib/types";
import { MILESTONE_INTERVAL_SECONDS, XP_PER_MINUTE, XP_SUB_PIECE_COMPLETE } from "@/lib/constants";
import { playCompleteSound, playMilestoneSound } from "@/lib/sound";

export function TimerPanel() {
  const router = useRouter();
  const activeProjectId = useFocusStore((s) => s.activeProjectId);
  const activeSubPieceId = useFocusStore((s) => s.activeSubPieceId);
  const projectOnlyFocus = useFocusStore((s) => s.projectOnlyFocus);
  const projects = useFocusStore((s) => s.projects);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Resolve sub-piece with priority:
  // 1. projectOnlyFocus: true — no sub-piece (project-only timer)
  // 2. activeSubPieceId if it points to an incomplete sub-piece under active project
  // 3. First incomplete sub-piece under active project
  // 4. No sub-piece (project-only)
  const resolvedSubPiece = useMemo(() => {
    if (!activeProject) return undefined;

    // If project-only focus mode is active, never resolve a sub-piece
    if (projectOnlyFocus) return undefined;

    if (activeSubPieceId) {
      const explicit = activeProject.subPieces.find(
        (sp) => sp.id === activeSubPieceId && sp.status !== "completed"
      );
      if (explicit) return explicit;
    }

    return activeProject.subPieces.find((sp) => sp.status !== "completed");
  }, [activeProject, activeSubPieceId, projectOnlyFocus]);

  // Schedule watcher: shows toast when a scheduled focus session is due
  const { dueSchedule } = useScheduleWatcher();
  const dueProject = projects.find((p) => p.id === dueSchedule?.projectId);
  const dueSubPiece = dueProject?.subPieces.find(
    (sp) => sp.id === dueSchedule?.subPieceId
  );

  // ALL hooks must be called unconditionally BEFORE any conditional return
  // to keep React hook count stable across renders.
  const [isSubPieceFormOpen, setIsSubPieceFormOpen] = useState(false);

  const handleComplete = useCallback(() => {
    setToastTrigger("complete");
    setShowSummary(true);
    playCompleteSound();
  }, []);

  const { isRunning, projectElapsed, subPieceRemaining, start, pause, reset, restart } =
    useTimer(activeProject?.id, resolvedSubPiece?.id, handleComplete);

  const [displayProjectElapsed, setDisplayProjectElapsed] = useState(projectElapsed);
  const [displaySubPieceRemaining, setDisplaySubPieceRemaining] = useState(subPieceRemaining);
  const ignoreNextProjectSyncRef = useRef(false);
  const ignoreNextSubPieceSyncRef = useRef(false);

  // Track previous isRunning to detect transitions (paused -> running)
  const prevIsRunningRef = useRef(isRunning);
  const [toastTrigger, setToastTrigger] = useState<
    "start" | "milestone" | "complete" | undefined
  >(undefined);
  const [showSummary, setShowSummary] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [resumeAfterSummary, setResumeAfterSummary] = useState(false);

  // Track last milestone (every 5 minutes = 300s)
  const lastMilestoneRef = useRef(0);
  // Track last tier for tier-change milestone
  const lastTierRef = useRef<string>("");

  const motivationContext: MotivationContext = useMemo(
    () => ({
      elapsedSeconds: projectElapsed,
      remainingSeconds: subPieceRemaining,
      isRunning,
      completedToday: 0,
    }),
    [projectElapsed, subPieceRemaining, isRunning]
  );

  // Detect start trigger: transition from paused to running
  useEffect(() => {
    if (!prevIsRunningRef.current && isRunning) {
      setToastTrigger("start");
    }
    prevIsRunningRef.current = isRunning;
  }, [isRunning]);

  // Detect milestone trigger: every N seconds of elapsed time
  useEffect(() => {
    if (!isRunning) return;
    const milestone = Math.floor(projectElapsed / MILESTONE_INTERVAL_SECONDS);
    if (milestone > lastMilestoneRef.current && milestone > 0) {
      lastMilestoneRef.current = milestone;
      setToastTrigger("milestone");
      playMilestoneSound();
    }
  }, [isRunning, projectElapsed]);

  // Detect tier-change milestone
  useEffect(() => {
    if (!isRunning) return;
    const motivation = getMotivation(motivationContext);
    if (lastTierRef.current && lastTierRef.current !== motivation.tier) {
      setToastTrigger("milestone");
      playMilestoneSound();
    }
    lastTierRef.current = motivation.tier;
  }, [isRunning, motivationContext]);

  // Extension control listeners: ff:start, ff:pause, ff:reset
  const handleExtensionStart = useCallback(() => {
    start();
  }, [start]);

  const handleExtensionPause = useCallback(() => {
    pause();
  }, [pause]);

  const handleExtensionReset = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (!activeProject || !resolvedSubPiece) return;

    window.addEventListener("ff:start", handleExtensionStart);
    window.addEventListener("ff:pause", handleExtensionPause);
    window.addEventListener("ff:reset", handleExtensionReset);

    return () => {
      window.removeEventListener("ff:start", handleExtensionStart);
      window.removeEventListener("ff:pause", handleExtensionPause);
      window.removeEventListener("ff:reset", handleExtensionReset);
    };
  }, [activeProject, resolvedSubPiece, handleExtensionStart, handleExtensionPause, handleExtensionReset]);

  useEffect(() => {
    if (ignoreNextProjectSyncRef.current) {
      ignoreNextProjectSyncRef.current = false;
      return;
    }
    setDisplayProjectElapsed(projectElapsed);
  }, [projectElapsed]);

  useEffect(() => {
    if (ignoreNextSubPieceSyncRef.current) {
      ignoreNextSubPieceSyncRef.current = false;
      return;
    }
    setDisplaySubPieceRemaining(subPieceRemaining);
  }, [subPieceRemaining]);

  // Listen for extension state broadcasts and keep displayed times accurate
  useEffect(() => {
    const handler = (e: Event) => {
      const state = (e as CustomEvent<ExtensionTimerState | undefined>).detail;
      if (!state || typeof state !== "object") return;
      if (
        typeof state.projectElapsed !== "number" ||
        typeof state.subPieceRemaining !== "number"
      ) {
        return;
      }
      ignoreNextProjectSyncRef.current = true;
      ignoreNextSubPieceSyncRef.current = true;
      setDisplayProjectElapsed(state.projectElapsed);
      setDisplaySubPieceRemaining(state.subPieceRemaining);
    };

    window.addEventListener("ff:state", handler);
    return () => window.removeEventListener("ff:state", handler);
  }, []);

  // When the active sub-piece changes mid-session (e.g. after refocusing a
  // completed sub-piece or adding a new one from the completion summary),
  // restart the timer so it picks up the new sub-piece's allocated time.
  const hasInitializedRef = useRef(false);
  const prevActiveSubPieceIdRef = useRef(activeSubPieceId);
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      prevActiveSubPieceIdRef.current = activeSubPieceId;
      return;
    }

    if (
      activeSubPieceId &&
      prevActiveSubPieceIdRef.current !== activeSubPieceId
    ) {
      restart();
    }
    prevActiveSubPieceIdRef.current = activeSubPieceId;
  }, [activeSubPieceId, restart]);

  // After closing the completion summary and updating the active focus,
  // reinitialize the timer to the new baseline and immediately start it so
  // the user isn't left on a frozen paused screen.
  useEffect(() => {
    if (!resumeAfterSummary) return;
    setResumeAfterSummary(false);
    restart();
    start();
  }, [resumeAfterSummary, restart, start]);

  // Reset trigger after it has been consumed by TimerToast
  const handleToastShown = () => {
    setToastTrigger(undefined);
  };

  const handleAddSubPiece = useCallback(() => {
    setShowSummary(false);
    setIsSubPieceFormOpen(true);
  }, []);

  const handleContinueProject = useCallback(() => {
    if (!activeProject) {
      setShowSummary(false);
      return;
    }

    // Continue at the project level only — no sub-piece countdown.
    useFocusStore.getState().setActiveProject(activeProject.id);

    setShowSummary(false);
    setResumeAfterSummary(true);
  }, [activeProject]);

  const handleBackToProjects = useCallback(() => {
    setShowSummary(false);
    router.push("/projects");
  }, [router]);

  const handleSubPieceAdded = useCallback(
    (subPieceId: string) => {
      if (activeProject) {
        useFocusStore.getState().setActiveSubPiece(activeProject.id, subPieceId);
      }
    },
    [activeProject]
  );

  const handleStart = useCallback(() => {
    const targetReached =
      activeProject &&
      activeProject.targetTimeSeconds > 0 &&
      projectElapsed >= activeProject.targetTimeSeconds;
    if (targetReached) {
      setShowRestartDialog(true);
    } else {
      start();
    }
  }, [activeProject, projectElapsed, start]);

  const handleRestartConfirm = useCallback(() => {
    if (!activeProject) return;
    useFocusStore.getState().restartProject(activeProject.id);
    restart();
    start();
    setShowRestartDialog(false);
  }, [activeProject, restart, start]);

  const handleExtendConfirm = useCallback(
    (additionalMinutes: number) => {
      if (!activeProject) return;
      useFocusStore.getState().updateProject(activeProject.id, {
        targetTimeSeconds: activeProject.targetTimeSeconds + additionalMinutes * 60,
      });
      start();
      setShowRestartDialog(false);
    },
    [activeProject, start]
  );

  // Empty state: no active project
  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FolderOpen className="h-8 w-8" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground">
            လက်ရှိ ပရောဂျက် မရွေးရသေးပါ
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            No active project — ပရောဂျက်တစ်ခုရွေးချယ်ပြီး စတင်လိုက်ပါ
          </p>
        </div>
        <Button
          onClick={() => router.push("/projects")}
          className="mt-2"
        >
          <span className="block">ပရောဂျက်တစ်ခုရွေးချယ်ပါ</span>
          <span className="block text-xs opacity-80">Choose a project</span>
        </Button>
      </div>
    );
  }

  // Find the most recently completed sub-piece for the summary
  const completedSubPiece = activeProject?.subPieces.find(
    (sp) => sp.status === "completed"
  );

  // Compute XP for the completed sub-piece
  const xpGained = completedSubPiece
    ? Math.floor(completedSubPiece.elapsedSeconds / 60) * XP_PER_MINUTE + XP_SUB_PIECE_COMPLETE
    : 0;

  // Compute project-summary values for project target completion
  const projectElapsedSeconds = Math.min(projectElapsed, activeProject.targetTimeSeconds);
  const projectXpGained = Math.floor(projectElapsedSeconds / 60) * XP_PER_MINUTE;

  // Show summary when a sub-piece just completed — this takes precedence over timer UI
  if (showSummary && completedSubPiece) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
        <TimerToast
          context={motivationContext}
          trigger={toastTrigger}
          onShown={handleToastShown}
        />
        <ScheduleToast
          dueSchedule={dueSchedule}
          projectName={dueProject?.name}
          subPieceName={dueSubPiece?.name}
        />
        <CompletionDialog
          open={showSummary}
          onOpenChange={setShowSummary}
          projectName={activeProject.name}
          subPieceName={completedSubPiece.name}
          elapsedSeconds={completedSubPiece.elapsedSeconds}
          allocatedMinutes={completedSubPiece.allocatedMinutes}
          xpGained={xpGained}
          onAddSubPiece={handleAddSubPiece}
          onContinueProject={handleContinueProject}
        />
        <SubPieceForm
          open={isSubPieceFormOpen}
          onOpenChange={setIsSubPieceFormOpen}
          projectId={activeProject.id}
          onSubPieceAdded={handleSubPieceAdded}
        />
      </div>
    );
  }

  // Show summary for project target completion (no sub-piece completed)
  if (showSummary && !completedSubPiece) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
        <TimerToast
          context={motivationContext}
          trigger={toastTrigger}
          onShown={handleToastShown}
        />
        <ScheduleToast
          dueSchedule={dueSchedule}
          projectName={dueProject?.name}
          subPieceName={dueSubPiece?.name}
        />
        <CompletionDialog
          open={showSummary}
          onOpenChange={setShowSummary}
          projectName={activeProject.name}
          elapsedSeconds={projectElapsedSeconds}
          allocatedMinutes={Math.round(activeProject.targetTimeSeconds / 60)}
          xpGained={projectXpGained}
          mode="project"
          onContinueProject={handleContinueProject}
          onBackToProjects={handleBackToProjects}
        />
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
      <TimerToast
        context={motivationContext}
        trigger={toastTrigger}
        onShown={handleToastShown}
      />
      <ScheduleToast
        dueSchedule={dueSchedule}
        projectName={dueProject?.name}
        subPieceName={dueSubPiece?.name}
      />

      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          {activeProject.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {resolvedSubPiece
            ? resolvedSubPiece.name
            : "ပရောဂျက် focus (Project Focus)"}
        </p>
      </div>

      <TimerDisplay
        projectElapsed={displayProjectElapsed}
        subPieceRemaining={displaySubPieceRemaining}
        isRunning={isRunning}
        allocatedMinutes={resolvedSubPiece?.allocatedMinutes}
        subPieceName={resolvedSubPiece?.name}
        targetTimeSeconds={activeProject.targetTimeSeconds}
      />

      <TimerControls
        isRunning={isRunning}
        onStart={handleStart}
        onPause={pause}
        onReset={reset}
      />

      <SubPieceForm
        open={isSubPieceFormOpen}
        onOpenChange={setIsSubPieceFormOpen}
        projectId={activeProject.id}
        onSubPieceAdded={handleSubPieceAdded}
      />

      <ProjectCompletedDialog
        open={showRestartDialog}
        onOpenChange={setShowRestartDialog}
        projectName={activeProject.name}
        totalTimeSeconds={projectElapsed}
        targetTimeSeconds={activeProject.targetTimeSeconds}
        onRestart={handleRestartConfirm}
        onExtend={handleExtendConfirm}
      />
    </div>
  );
}
