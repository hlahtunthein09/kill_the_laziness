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
    icon: <Circle className="h-3.5 w-3.5 text-stone-400" />,
    badgeClass: "bg-stone-100 text-stone-600 border-stone-200",
    dotClass: "bg-stone-400",
  },
  running: {
    label: "လုပ်ဆောင်နေသည်",
    en: "Running",
    icon: <PlayCircle className="h-3.5 w-3.5 text-teal-500" />,
    badgeClass: "bg-teal-100 text-teal-700 border-teal-200",
    dotClass: "bg-teal-500",
  },
  paused: {
    label: "ခဏရပ်ထား",
    en: "Paused",
    icon: <PauseCircle className="h-3.5 w-3.5 text-amber-500" />,
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
  },
  completed: {
    label: "ပြီးစီး",
    en: "Completed",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
};

export function SubPieceCard({ subPiece, projectId }: SubPieceCardProps) {
  const router = useRouter();
  const setActiveProject = useFocusStore((state) => state.setActiveProject);
  const setActiveSubPiece = useFocusStore((state) => state.setActiveSubPiece);
  const status = STATUS_CONFIG[subPiece.status] ?? STATUS_CONFIG.idle;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAllocatedMinutes, setNewAllocatedMinutes] = useState(subPiece.allocatedMinutes);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleFocus = () => {
    setActiveProject(projectId);
    setActiveSubPiece(projectId, subPiece.id);
    router.push("/timer");
  };

  const handleRefocus = () => {
    useFocusStore.getState().refocusSubPiece(projectId, subPiece.id, newAllocatedMinutes);
    setActiveProject(projectId);
    setActiveSubPiece(projectId, subPiece.id);
    router.push("/timer");
    setIsDialogOpen(false);
  };

  const isCompleted = subPiece.status === "completed";

  const handleDetailFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) {
      setIsDialogOpen(true);
    } else {
      handleFocus();
    }
    setIsDetailOpen(false);
  };

  return (
    <>
      <div
        className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-white/60 border border-stone-100 hover:bg-white/90 transition-colors cursor-pointer"
        onClick={() => setIsDetailOpen(true)}
        data-testid="subpiece-row"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {status.icon}
          <span className="text-sm font-medium text-stone-800 truncate">
            {subPiece.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-xs text-stone-500">
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
            onClick={(e) => {
              e.stopPropagation();
              if (isCompleted) {
                setIsDialogOpen(true);
              } else {
                handleFocus();
              }
            }}
            className="h-7 px-2 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-100 border-teal-200 shadow-sm hover:shadow cursor-pointer"
            data-testid="focus-button"
          >
            <Target className="h-3.5 w-3.5 mr-1" />
            Focus
          </Button>
        </div>
      </div>

      {/* Refocus Dialog (for completed sub-pieces) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              အခန်းကဏ်ဍကို ပြန်စ focus လုပ်မယ် (Refocus Sub-piece)
            </DialogTitle>
            <DialogDescription>
              ဒီအခန်းကဏ်ဍ ပြီးစီးသွားပါပြီ။ ပြန်စ focus လုပ်ချင်ပါသလား? / This sub-piece is completed. Refocus will reset its progress.
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
            />
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
              data-testid="refocus-confirm-button"
            >
              focus လုပ်မယ် (Refocus)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    <span className="text-sm text-stone-500">Allocated</span>
                    <span className="text-sm font-medium" data-testid="detail-allocated">
                      {subPiece.allocatedMinutes} မိနစ်
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500">Elapsed</span>
                    <span className="text-sm font-medium" data-testid="detail-elapsed">
                      {formatDuration(subPiece.elapsedSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500">Status</span>
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
