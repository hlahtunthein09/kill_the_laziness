"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/time";
import { CheckCircle2, Clock, Target, Sparkles } from "lucide-react";

type CompletionMode = "sub-piece" | "project";

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  subPieceName?: string;
  elapsedSeconds: number;
  allocatedMinutes: number;
  xpGained: number;
  mode?: CompletionMode;
  onAddSubPiece?: () => void;
  onContinueProject?: () => void;
}

export function CompletionDialog({
  open,
  onOpenChange,
  projectName,
  subPieceName,
  elapsedSeconds,
  allocatedMinutes,
  xpGained,
  mode = "sub-piece",
  onAddSubPiece,
  onContinueProject,
}: CompletionDialogProps) {
  const isProjectMode = mode === "project";

  return (
    <Dialog open={open} onOpenChange={onOpenChange} dismissible={false}>
      <DialogContent className="bg-card text-foreground border-border sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" />
            <DialogTitle>
              {isProjectMode
                ? "ပရောဂျက်ပစ်မှတ် ရောက်ရှိ (Project Target Reached)"
                : "အခန်းကဏ္ဍ ပြီးစီး (Sub-piece Complete)"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isProjectMode ? projectName : `${projectName} — ${subPieceName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center gap-2 text-foreground">
            <Target className="size-4 text-sky-500" />
            <span>
              {isProjectMode
                ? projectName
                : `${projectName} — ${subPieceName}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Clock className="size-4 text-teal-500" />
            <span>
              Focused: {formatDuration(elapsedSeconds)} / {allocatedMinutes}m allocated
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="size-4 text-amber-400" />
            <span>XP gained: +{xpGained}</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col bg-card border-0">
          {isProjectMode ? (
            <Button
              className="w-full h-auto whitespace-normal px-4 py-2"
              onClick={() => {
                if (onContinueProject) {
                  onContinueProject();
                } else {
                  onOpenChange(false);
                }
              }}
            >
              ဆက်လက်ပါ
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="w-full h-auto whitespace-normal px-4 py-2"
                onClick={onAddSubPiece}
              >
                အခန်းကဏ္ဍအသစ်ထည့်ရန်
              </Button>
              <Button
                className="w-full h-auto whitespace-normal px-4 py-2"
                onClick={onContinueProject}
              >
                {projectName} ကို ဆက်လက်ပြီး focus လုပ်မယ်
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
