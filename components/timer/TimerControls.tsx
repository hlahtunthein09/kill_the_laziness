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
      <Button
        onClick={onStart}
        disabled={isRunning}
        className="gap-1.5"
        data-testid="timer-start"
      >
        <Play className="h-4 w-4" />
        စတင် (Start)
      </Button>

      <Button
        onClick={onPause}
        disabled={!isRunning}
        variant="secondary"
        className="gap-1.5"
        data-testid="timer-pause"
      >
        <Pause className="h-4 w-4" />
        ခဏရပ် (Pause)
      </Button>

      <Button
        onClick={onReset}
        variant="outline"
        className="gap-1.5"
        data-testid="timer-reset"
      >
        <RotateCcw className="h-4 w-4" />
        ပြန်စ (Reset)
      </Button>
    </div>
  );
}
