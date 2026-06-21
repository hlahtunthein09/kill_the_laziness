"use client";

import { useFocusStore } from "@/lib/store/useFocusStore";
import { useTimer } from "@/hooks/useTimer";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { FolderOpen, ListTodo } from "lucide-react";

export function TimerPanel() {
  const activeProjectId = useFocusStore((s) => s.activeProjectId);
  const projects = useFocusStore((s) => s.projects);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const firstIncompleteSubPiece = activeProject?.subPieces.find(
    (sp) => sp.status !== "completed"
  );

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

  const { isRunning, projectElapsed, subPieceRemaining, start, pause, reset } =
    useTimer(activeProject.id, firstIncompleteSubPiece.id);

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
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
