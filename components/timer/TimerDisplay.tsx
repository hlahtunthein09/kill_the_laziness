"use client";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";
import { Badge } from "@/components/ui/badge";

interface TimerDisplayProps {
  projectElapsed: number;
  subPieceRemaining: number;
  isRunning: boolean;
  allocatedMinutes?: number;
  subPieceName?: string;
  targetTimeSeconds?: number;
}

export function TimerDisplay({
  projectElapsed,
  subPieceRemaining,
  isRunning,
  allocatedMinutes,
  subPieceName,
  targetTimeSeconds,
}: TimerDisplayProps) {
  const statusLabel = isRunning
    ? { label: "လုပ်ဆောင်နေသည်", en: "Running", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" }
    : { label: "ခဏရပ်ထား", en: "Paused", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" };

  const showRemaining = allocatedMinutes && allocatedMinutes > 0;
  const showTarget = targetTimeSeconds && targetTimeSeconds > 0;
  const progressPercent = showTarget
    ? Math.min(100, (projectElapsed / targetTimeSeconds) * 100)
    : 0;
  const subPieceElapsed = showRemaining
    ? Math.max(0, allocatedMinutes! * 60 - subPieceRemaining)
    : 0;

  return (
    <div className="flex flex-col items-center gap-6 p-6 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("text-xs font-medium", statusLabel.color)}>
          {statusLabel.label} ({statusLabel.en})
        </Badge>
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-xs text-muted-foreground">ပရောဂျက်တစ်ခုလုံး၏ အချိန် (Project Time)</span>
        <span className="text-4xl font-bold text-foreground tabular-nums px-4 py-1 rounded-lg border border-primary/30 bg-primary/5 ring-1 ring-primary/20">
          {formatDuration(projectElapsed)}
        </span>

        {showTarget && (
          <div className="w-full flex flex-col items-center gap-2">
            <span className="text-sm font-semibold text-primary" data-testid="target-label">
              Project အတွက်အချိန် (Target): {formatDuration(targetTimeSeconds)}
            </span>
            <div
              className="w-full h-2 rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              data-testid="target-progress"
            >
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
                data-testid="target-progress-fill"
              />
            </div>
          </div>
        )}
      </div>

      {showRemaining && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs text-muted-foreground" data-testid="subpiece-elapsed-label">
            {subPieceName ? (
              <>
                <span className="font-semibold text-primary">{subPieceName}</span>
                {" "}အတွက် အသုံးပြုပြီးအချိန်
              </>
            ) : (
              "အသုံးပြုပြီးအချိန်"
            )}
            {" "}(Elapsed)
          </span>
          <span className="text-2xl font-semibold tabular-nums px-3 py-0.5 rounded-lg border ring-1 text-foreground border-border bg-muted/50 ring-border" data-testid="subpiece-elapsed-value">
            {formatDuration(subPieceElapsed)}
          </span>
          <span className="text-sm font-semibold text-primary" data-testid="subpiece-target-label">
            သတ်မှတ်ထားသော အချိန်: {formatDuration(allocatedMinutes! * 60)}
          </span>
        </div>
      )}
    </div>
  );
}
