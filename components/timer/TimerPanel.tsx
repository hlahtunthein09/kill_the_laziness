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
import { FolderOpen } from "lucide-react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { MotivationContext } from "@/lib/motivation";
import { getMotivation } from "@/lib/motivation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  const [projectCompleted, setProjectCompleted] = useState(false);
  const [isSubPieceFormOpen, setIsSubPieceFormOpen] = useState(false);

  const handleComplete = useCallback(() => {
    setToastTrigger("complete");
    setShowSummary(true);
    setProjectCompleted(true);
    playCompleteSound();
  }, []);

  const { isRunning, projectElapsed, subPieceRemaining, start, pause, reset, reinitialize, resetToZero } =
    useTimer(activeProject?.id, resolvedSubPiece?.id, handleComplete);

  // Track previous isRunning to detect transitions (paused -> running)
  const prevIsRunningRef = useRef(isRunning);
  const [toastTrigger, setToastTrigger] = useState<
    "start" | "milestone" | "complete" | undefined
  >(undefined);
  const [showSummary, setShowSummary] = useState(false);

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

  // Reset trigger after it has been consumed by TimerToast
  const handleToastShown = () => {
    setToastTrigger(undefined);
  };

  const handleContinue = () => {
    reinitialize();
    setShowSummary(false);
    setProjectCompleted(false);
  };

  const handleAddSubPiece = useCallback(() => {
    setShowSummary(false);
    setIsSubPieceFormOpen(true);
  }, []);

  const handleContinueProject = useCallback(() => {
    if (activeProject) {
      useFocusStore.getState().setActiveProject(activeProject.id);
    }
    reinitialize();
    setShowSummary(false);
  }, [activeProject, reinitialize]);

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
          onContinueProject={() => {
            reinitialize();
            setShowSummary(false);
          }}
        />
        <SubPieceForm
          open={isSubPieceFormOpen}
          onOpenChange={setIsSubPieceFormOpen}
          projectId={activeProject.id}
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
        projectElapsed={projectElapsed}
        subPieceRemaining={subPieceRemaining}
        isRunning={isRunning}
        allocatedMinutes={resolvedSubPiece?.allocatedMinutes}
        subPieceName={resolvedSubPiece?.name}
        targetTimeSeconds={activeProject.targetTimeSeconds}
      />

      <TimerControls
        isRunning={isRunning}
        onStart={start}
        onPause={pause}
        onReset={reset}
      />

      <SubPieceForm
        open={isSubPieceFormOpen}
        onOpenChange={setIsSubPieceFormOpen}
        projectId={activeProject.id}
      />
    </div>
  );
}
