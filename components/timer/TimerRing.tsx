"use client";

import { cn } from "@/lib/utils";

interface TimerRingProps {
  remainingSeconds: number;
  allocatedMinutes: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function TimerRing({
  remainingSeconds,
  allocatedMinutes,
  size = 180,
  strokeWidth = 12,
  className,
}: TimerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.max(0, remainingSeconds / (allocatedMinutes * 60));
  const offset = circumference * (1 - fraction);

  const colorClass =
    fraction > 0.5
      ? "text-teal-500"
      : fraction > 0.2
        ? "text-amber-500"
        : "text-rose-500";

  return (
    <svg
      width={size}
      height={size}
      className={cn(colorClass, className)}
      data-testid="timer-ring"
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity={0.15}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </g>
    </svg>
  );
}
