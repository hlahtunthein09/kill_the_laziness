"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";
import { getMotivation } from "@/lib/motivation";
import { CheckCircle2, Clock, Target, Sparkles } from "lucide-react";

interface SessionSummaryProps {
  projectName: string;
  subPieceName: string;
  elapsedSeconds: number;
  allocatedMinutes: number;
  xpGained: number;
  className?: string;
}

export function SessionSummary({
  projectName,
  subPieceName,
  elapsedSeconds,
  allocatedMinutes,
  xpGained,
  className,
}: SessionSummaryProps) {
  const motivation = getMotivation({
    elapsedSeconds,
    remainingSeconds: 0,
    isRunning: false,
    completedToday: 1,
  });

  return (
    <Card className={cn("rounded-xl border border-border bg-card p-6 shadow-sm", className)}>
      <CardHeader className="gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-emerald-500" />
          <CardTitle>အချိန်ပြည့် focus session (Focus Session Complete)</CardTitle>
        </div>
        <CardDescription>{motivation.my}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-foreground">
          <Target className="size-4 text-sky-500" />
          <span>{projectName} — {subPieceName}</span>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <Clock className="size-4 text-teal-500" />
          <span>Focused: {formatDuration(elapsedSeconds)} / {allocatedMinutes}m allocated</span>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="size-4 text-amber-400" />
          <span>XP gained: +{xpGained}</span>
        </div>
      </CardContent>
    </Card>
  );
}
