"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/lib/time";

interface ProjectCompletedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  totalTimeSeconds: number;
  targetTimeSeconds: number;
  onRestart: () => void;
  onExtend: (additionalMinutes: number) => void;
}

export function ProjectCompletedDialog({
  open,
  onOpenChange,
  projectName,
  totalTimeSeconds,
  targetTimeSeconds,
  onRestart,
  onExtend,
}: ProjectCompletedDialogProps) {
  const [additionalMinutes, setAdditionalMinutes] = useState(30);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setAdditionalMinutes(30);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ပရောဂျက်ပြီးစီးသွားပါပြီ (Project Completed)</DialogTitle>
          <DialogDescription>
            {projectName} အတွက် ပစ်မှတ်အချိန် ပြည့်သွားပါပြီ။
            <br />
            Time used: {formatDuration(totalTimeSeconds)} / Target:{" "}
            {formatDuration(targetTimeSeconds)}
            <br />
            <span className="text-muted-foreground">
              This project has reached its target. Extend the target or restart from zero to keep focusing.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <label htmlFor="extend-minutes" className="text-sm font-medium">
            ထပ်တိုးမယ့် မိနစ် (Minutes to add)
          </label>
          <Input
            id="extend-minutes"
            type="number"
            min={1}
            step={5}
            value={additionalMinutes}
            onChange={(e) => setAdditionalMinutes(Number(e.target.value))}
            data-testid="extend-minutes-input"
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            မလုပ်ပါ (Cancel)
          </Button>
          <Button variant="outline" onClick={onRestart} data-testid="restart-project-btn">
            သုညက ပြန်စမယ် (Restart)
          </Button>
          <Button onClick={() => onExtend(additionalMinutes)} data-testid="extend-target-btn">
            ပစ်မှတ်တိုးမယ် (Extend)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
