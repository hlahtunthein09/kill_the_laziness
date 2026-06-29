"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-3 justify-center">
      {isRunning ? (
        <Button
          onClick={onPause}
          variant="outline"
          className="gap-1.5 bg-card border-border hover:bg-card hover:text-primary hover:border-primary/50 hover:shadow-[0_0_10px_rgba(198,241,53,0.12)]"
          data-testid="timer-pause"
        >
          <Pause className="h-4 w-4" />
          ခဏရပ် (Pause)
        </Button>
      ) : (
        <Button
          onClick={onStart}
          className="gap-1.5"
          data-testid="timer-start"
        >
          <Play className="h-4 w-4" />
          စတင် (Start)
        </Button>
      )}

      <Button
        onClick={onReset}
        variant="outline"
        className="gap-1.5 bg-card border-border hover:bg-card hover:text-primary hover:border-primary/50 hover:shadow-[0_0_10px_rgba(198,241,53,0.12)]"
        data-testid="timer-reset"
      >
        <RotateCcw className="h-4 w-4" />
        မူလမှပြန်စမယ် (Discard Session)
      </Button>
    </div>
  );
}
