"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SubPiece } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { formatDuration } from "@/lib/time";
import { getRemainingTargetSeconds, doesSubPieceFit } from "@/lib/project";
import { ProjectCompletedDialog } from "./ProjectCompletedDialog";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, CheckCircle2, PauseCircle, PlayCircle, Circle, Target } from "lucide-react";

interface SubPieceCardProps {
  subPiece: SubPiece;
  projectId: string;
}

const STATUS_CONFIG: Record<string, { label: string; en: string; icon: React.ReactNode; badgeClass: string; dotClass: string }> = {
  idle: {
    label: "ပြီးစီးခြင်းမရှိသေးပါ",
    en: "Idle",
    icon: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
  running: {
    label: "လုပ်ဆောင်နေသည်",
    en: "Running",
    icon: <PlayCircle className="h-3.5 w-3.5 text-primary" />,
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    dotClass: "bg-primary",
  },
  paused: {
    label: "ခဏရပ်ထား",
    en: "Paused",
    icon: <PauseCircle className="h-3.5 w-3.5 text-amber-400" />,
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dotClass: "bg-amber-400",
  },
  completed: {
    label: "ပြီးစီး",
    en: "Completed",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dotClass: "bg-emerald-400",
  },
};

export function SubPieceCard({ subPiece, projectId }: SubPieceCardProps) {
  const router = useRouter();
  const setActiveProject = useFocusStore((state) => state.setActiveProject);
  const setActiveSubPiece = useFocusStore((state) => state.setActiveSubPiece);
  const project = useFocusStore((state) => state.getProjectById(projectId));
  const status = STATUS_CONFIG[subPiece.status] ?? STATUS_CONFIG.idle;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProjectCompletedDialogOpen, setIsProjectCompletedDialogOpen] = useState(false);
  const [newAllocatedMinutes, setNewAllocatedMinutes] = useState(subPiece.allocatedMinutes);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(1);
  const [extendContext, setExtendContext] = useState<"warning" | "refocus" | null>(null);

  const isTargetReached =
    project && project.targetTimeSeconds > 0 && project.totalTimeSeconds >= project.targetTimeSeconds;

  const remainingMinutes = project ? Math.floor(getRemainingTargetSeconds(project) / 60) : 0;
  const isRefocusOverBudget = newAllocatedMinutes > remainingMinutes;

  const handleFocus = () => {
    setActiveProject(projectId);
    setActiveSubPiece(projectId, subPiece.id);
    router.push("/timer");
  };

  const handleFocusWholeProject = () => {
    setActiveProject(projectId);
    router.push("/timer");
    setIsWarningDialogOpen(false);
  };

  const openExtendDialogFromWarning = () => {
    if (!project) return;
    const deficitMinutes = Math.max(1, subPiece.allocatedMinutes - remainingMinutes);
    setExtendMinutes(deficitMinutes);
    setExtendContext("warning");
    setIsWarningDialogOpen(false);
    setIsExtendDialogOpen(true);
  };

  const openExtendDialogFromRefocus = () => {
    if (!project) return;
    const deficitMinutes = Math.max(1, newAllocatedMinutes - remainingMinutes);
    setExtendMinutes(deficitMinutes);
    setExtendContext("refocus");
    setIsDialogOpen(false);
    setIsExtendDialogOpen(true);
  };

  const handleExtendConfirm = () => {
    if (!project || !extendContext) return;
    const minutes = Math.max(1, extendMinutes);
    useFocusStore.getState().updateProject(projectId, {
      targetTimeSeconds: project.targetTimeSeconds + minutes * 60,
    });
    setIsExtendDialogOpen(false);
    setExtendContext(null);
    if (extendContext === "warning") {
      handleFocus();
    } else {
      performRefocus(newAllocatedMinutes);
    }
  };

  const handleExtendCancel = () => {
    setIsExtendDialogOpen(false);
    setExtendContext(null);
  };

  const tryFocusSubPiece = () => {
    if (!project) return;
    if (doesSubPieceFit(project, subPiece)) {
      handleFocus();
    } else {
      setIsWarningDialogOpen(true);
    }
  };

  const performRefocus = (minutes: number) => {
    useFocusStore.getState().refocusSubPiece(projectId, subPiece.id, minutes);
    setActiveProject(projectId);
    setActiveSubPiece(projectId, subPiece.id);
    router.push("/timer");
    setIsDialogOpen(false);
  };

  const handleRefocus = () => {
    if (!project || isRefocusOverBudget) return;
    performRefocus(newAllocatedMinutes);
  };

  const handleProjectRestart = () => {
    useFocusStore.getState().restartProject(projectId);
    performRefocus(newAllocatedMinutes);
    setIsProjectCompletedDialogOpen(false);
  };

  const handleProjectExtend = (additionalMinutes: number) => {
    if (!project) return;
    useFocusStore.getState().updateProject(projectId, {
      targetTimeSeconds: project.targetTimeSeconds + additionalMinutes * 60,
    });
    performRefocus(newAllocatedMinutes);
    setIsProjectCompletedDialogOpen(false);
  };

  const isCompleted = subPiece.status === "completed";

  const handleDetailFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTargetReached) {
      setIsProjectCompletedDialogOpen(true);
    } else if (isCompleted) {
      setIsDialogOpen(true);
    } else {
      tryFocusSubPiece();
    }
    setIsDetailOpen(false);
  };

  const handleInlineFocusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTargetReached) {
      setIsProjectCompletedDialogOpen(true);
    } else if (isCompleted) {
      setIsDialogOpen(true);
    } else {
      tryFocusSubPiece();
    }
  };

  return (
    <>
      <div
        className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-transparent border border-border hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => setIsDetailOpen(true)}
        data-testid="subpiece-row"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {status.icon}
          <span className="text-sm font-medium text-foreground truncate">
            {subPiece.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {subPiece.allocatedMinutes} မိနစ်
          </span>
          <span
            title={`${status.label} (${status.en})`}
            className={cn("size-2 rounded-full", status.dotClass)}
            data-testid="status-dot"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleInlineFocusClick}
            className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 border-primary/50 shadow-sm hover:shadow cursor-pointer"
            data-testid="focus-button"
          >
            <Target className="h-3.5 w-3.5 mr-1" />
            Focus
          </Button>
        </div>
      </div>

      {/* Refocus Dialog (for completed sub-pieces) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} dismissible={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              အခန်းကဏ္ဍကို ပြန်စ focus လုပ်မယ် (Refocus Sub-piece)
            </DialogTitle>
            <DialogDescription>
              ဒီအခန်းကဏ္ဍ ပြီးစီးသွားပါပြီ။ ပြန်စ focus လုပ်ချင်ပါသလား? / This sub-piece is completed. Refocus will reset its progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <label htmlFor="duration" className="text-sm font-medium">
              ကြာချိန် မိနစ် (Duration in minutes)
            </label>
            <Input
              id="duration"
              type="number"
              min={1}
              value={newAllocatedMinutes}
              onChange={(e) => setNewAllocatedMinutes(Number(e.target.value))}
              data-testid="refocus-duration-input"
              aria-invalid={isRefocusOverBudget}
            />
            {isRefocusOverBudget && (
              <p className="text-sm text-destructive" data-testid="refocus-error">
                ပစ်မှတ်အချိန် {remainingMinutes} မိနစ်သာ ကျန်ပါတယ်။ ဤအခန်းကဏ္ဍအတွက် အများဆုံး {remainingMinutes} မိနစ်သာ ရွေးနိုင်ပါတယ်။
              </p>
            )}
            {isRefocusOverBudget && (
              <Button
                variant="link"
                className="h-auto p-0 justify-start"
                onClick={openExtendDialogFromRefocus}
                data-testid="refocus-extend-button"
              >
                ပစ်မှတ်အချိန်တိုးမယ် (Extend target)
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              data-testid="refocus-cancel-button"
            >
              မလုပ်ပါ (Cancel)
            </Button>
            <Button
              onClick={handleRefocus}
              disabled={isRefocusOverBudget}
              data-testid="refocus-confirm-button"
            >
              focus လုပ်မယ် (Refocus)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog (over-budget focus attempt) */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>
              ဤအခန်းကဏ္ဍအတွက် အချိန်မလုံလောက်ပါ (Not enough time for this sub-piece)
            </DialogTitle>
            <DialogDescription data-testid="warning-description" className="mb-2">
              &ldquo;{project?.name}&rdquo; မှ ပစ်မှတ်အချိန်သို့ {remainingMinutes} မိနစ်သာ ကျန်ပါတယ်။ &ldquo;{subPiece.name}&rdquo; အတွက် {subPiece.allocatedMinutes} မိနစ် လိုအပ်ပါတယ်။
              <br />
              <span className="text-muted-foreground">
                Not enough target time remaining for this sub-piece.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-3 mt-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsWarningDialogOpen(false)}
              data-testid="warning-cancel-button"
            >
              မလုပ်ပါ (Cancel)
            </Button>
            <Button
              variant="outline"
              onClick={handleFocusWholeProject}
              data-testid="warning-focus-whole-button"
            >
              ပရောဂျက်တစ်ခုလုံး focus လုပ်မယ် (Focus whole project)
            </Button>
            <Button
              onClick={openExtendDialogFromWarning}
              data-testid="warning-extend-button"
            >
              ပစ်မှတ်အချိန်တိုးမယ် (Extend target)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Target Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent className="p-6" data-testid="extend-dialog">
          <DialogHeader>
            <DialogTitle>ပရောဂျက်အတွက် အချိန်တိုးမည် (Extend Project Target)</DialogTitle>
            <DialogDescription className="mb-2">
              ဘယ်လောက်မိနစ် တိုးချင်ပါသလဲ? (How many minutes to add?)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Input
              type="number"
              min={1}
              value={extendMinutes}
              onChange={(e) => setExtendMinutes(Number(e.target.value))}
              data-testid="extend-minutes-input"
            />
          </div>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={handleExtendCancel}
              data-testid="extend-cancel-button"
            >
              မလုပ်ပါ (Cancel)
            </Button>
            <Button
              onClick={handleExtendConfirm}
              data-testid="extend-confirm-button"
            >
              တိုးမယ် (Extend)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProjectCompletedDialog
        open={isProjectCompletedDialogOpen}
        onOpenChange={setIsProjectCompletedDialogOpen}
        projectName={project?.name ?? ""}
        totalTimeSeconds={project?.totalTimeSeconds ?? 0}
        targetTimeSeconds={project?.targetTimeSeconds ?? 0}
        onRestart={handleProjectRestart}
        onExtend={handleProjectExtend}
      />

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <AnimatePresence>
          {isDetailOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <DialogContent data-testid="detail-dialog">
                <DialogHeader>
                  <DialogTitle data-testid="detail-name">
                    {subPiece.name}
                  </DialogTitle>
                  <DialogDescription>
                    Sub-piece details
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Allocated</span>
                    <span className="text-sm font-medium" data-testid="detail-allocated">
                      {subPiece.allocatedMinutes} မိနစ်
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Elapsed</span>
                    <span className="text-sm font-medium" data-testid="detail-elapsed">
                      {formatDuration(subPiece.elapsedSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", status.badgeClass)} data-testid="detail-status">
                      {status.icon}
                      {status.label} ({status.en})
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailOpen(false)}
                    data-testid="detail-close-button"
                  >
                    ပိတ်မယ် (Close)
                  </Button>
                  <Button
                    onClick={handleDetailFocus}
                    data-testid="detail-focus-button"
                  >
                    <Target className="h-3.5 w-3.5 mr-1" />
                    Focus
                  </Button>
                </DialogFooter>
              </DialogContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>
    </>
  );
}
