"use client";

import { useFocusStore } from "@/lib/store/useFocusStore";
import { useTimer } from "@/hooks/useTimer";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { TimerToast } from "./TimerToast";
import { FolderOpen, ListTodo } from "lucide-react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { MotivationContext } from "@/lib/motivation";
import { getMotivation } from "@/lib/motivation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SessionSummary } from "./SessionSummary";
import { XP_PER_MINUTE, XP_SUB_PIECE_COMPLETE } from "@/lib/constants";
import { playCompleteSound, playMilestoneSound } from "@/lib/sound";

export function TimerPanel() {
  const router = useRouter();
  const activeProjectId = useFocusStore((s) => s.activeProjectId);
  const projects = useFocusStore((s) => s.projects);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const firstIncompleteSubPiece = activeProject?.subPieces.find(
    (sp) => sp.status !== "completed"
  );

  // ALL hooks must be called unconditionally BEFORE any conditional return
  // to keep React hook count stable across renders.
  const { isRunning, projectElapsed, subPieceRemaining, start, pause, reset } =
    useTimer(activeProject?.id, firstIncompleteSubPiece?.id);

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

  // Detect milestone trigger: every 5 minutes of elapsed time
  useEffect(() => {
    if (!isRunning) return;
    const milestone = Math.floor(projectElapsed / 300);
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

  // Detect complete trigger: sub-piece finished (remaining went from >0 to 0)
  const prevSubPieceRemainingRef = useRef(subPieceRemaining);
  useEffect(() => {
    if (
      prevSubPieceRemainingRef.current > 0 &&
      subPieceRemaining === 0
    ) {
      setToastTrigger("complete");
      setShowSummary(true);
      playCompleteSound();
    }
    prevSubPieceRemainingRef.current = subPieceRemaining;
  }, [subPieceRemaining]);

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
    if (!activeProject || !firstIncompleteSubPiece) return;

    window.addEventListener("ff:start", handleExtensionStart);
    window.addEventListener("ff:pause", handleExtensionPause);
    window.addEventListener("ff:reset", handleExtensionReset);

    return () => {
      window.removeEventListener("ff:start", handleExtensionStart);
      window.removeEventListener("ff:pause", handleExtensionPause);
      window.removeEventListener("ff:reset", handleExtensionReset);
    };
  }, [activeProject, firstIncompleteSubPiece, handleExtensionStart, handleExtensionPause, handleExtensionReset]);

  // Reset trigger after it has been consumed by TimerToast
  const handleToastShown = () => {
    setToastTrigger(undefined);
  };

  const handleContinue = () => {
    reset();
    setShowSummary(false);
  };

  // Empty state: no active project
  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-500">
          <FolderOpen className="h-8 w-8" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-stone-700">
            လက်ရှိ ပရောဂျက် မရွေးရသေးပါ
          </p>
          <p className="text-sm text-stone-400 mt-1">
            No active project — ပရောဂျက်တစ်ခုရွေးချယ်ပြီး စတင်လိုက်ပါ
          </p>
        </div>
        <Button
          onClick={() => router.push("/projects")}
          className="mt-2 bg-teal-500 hover:bg-teal-600 text-white"
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

  // Show summary when a sub-piece just completed — this takes precedence over empty state
  if (showSummary && completedSubPiece) {
    return (
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
        <TimerToast
          context={motivationContext}
          trigger={toastTrigger}
          onShown={handleToastShown}
        />
        <div className="w-full flex flex-col items-center gap-4">
          <SessionSummary
            projectName={activeProject.name}
            subPieceName={completedSubPiece.name}
            elapsedSeconds={completedSubPiece.elapsedSeconds}
            allocatedMinutes={completedSubPiece.allocatedMinutes}
            xpGained={xpGained}
          />
          <Button
            onClick={handleContinue}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            <span className="block">ဆက်လက်ပါ</span>
            <span className="block text-xs opacity-80">Continue</span>
          </Button>
        </div>
      </div>
    );
  }

  // Empty state: no incomplete sub-pieces
  if (!firstIncompleteSubPiece) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
          <ListTodo className="h-8 w-8" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-stone-700">
            အခန်းကဏ္ဍများ မရှိသေးပါ
          </p>
          <p className="text-sm text-stone-400 mt-1">
            No sub-pieces to focus on — အခန်းကဏ္ဍအသစ်ထည့်ပြီး စတင်လိုက်ပါ
          </p>
        </div>
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

      <div className="text-center">
        <h2 className="text-lg font-semibold text-stone-900">
          {activeProject.name}
        </h2>
        <p className="text-sm text-stone-500">
          {firstIncompleteSubPiece.name}
        </p>
      </div>

      <TimerDisplay
        projectElapsed={projectElapsed}
        subPieceRemaining={subPieceRemaining}
        isRunning={isRunning}
        allocatedMinutes={firstIncompleteSubPiece.allocatedMinutes}
      />

      <TimerControls
        isRunning={isRunning}
        onStart={start}
        onPause={pause}
        onReset={reset}
      />
    </div>
  );
}
