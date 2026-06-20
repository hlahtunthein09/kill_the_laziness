"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";
import type { Project } from "@/lib/types";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressTrack, ProgressIndicator, ProgressValue } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

const COLOR_MAP: Record<string, { dot: string; badge: string; progress: string }> = {
  mint: {
    dot: "bg-teal-400",
    badge: "bg-teal-100 text-teal-700 border-teal-200",
    progress: "bg-teal-500",
  },
  ocean: {
    dot: "bg-sky-400",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    progress: "bg-sky-500",
  },
  sand: {
    dot: "bg-amber-300",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    progress: "bg-amber-500",
  },
  forest: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    progress: "bg-emerald-500",
  },
  coral: {
    dot: "bg-rose-400",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    progress: "bg-rose-500",
  },
};

const STATUS_LABELS: Record<string, { label: string; en: string }> = {
  idle: { label: "အားနေသည်", en: "Idle" },
  running: { label: "လုပ်ဆောင်နေသည်", en: "Running" },
  paused: { label: "ခဏရပ်ထား", en: "Paused" },
  completed: { label: "ပြီးစီး", en: "Completed" },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const colorStyle = COLOR_MAP[project.color] ?? COLOR_MAP.mint;
  const statusInfo = STATUS_LABELS[project.status] ?? STATUS_LABELS.idle;

  const progressPercent = useMemo(() => {
    if (project.targetTimeSeconds <= 0) return 0;
    return Math.min(100, Math.round((project.totalTimeSeconds / project.targetTimeSeconds) * 100));
  }, [project.totalTimeSeconds, project.targetTimeSeconds]);

  const formattedTime = useMemo(() => formatDuration(project.totalTimeSeconds), [project.totalTimeSeconds]);
  const formattedTarget = useMemo(() => formatDuration(project.targetTimeSeconds), [project.targetTimeSeconds]);

  const description = project.description?.trim();

  return (
    <Card className="group bg-card-glow hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className={cn("size-3 rounded-full shrink-0", colorStyle.dot)} />
          <CardTitle className="text-base font-semibold text-stone-900 truncate">
            {project.name}
          </CardTitle>
        </div>
        {description && (
          <CardDescription className="text-xs text-stone-500 line-clamp-2 mt-1">
            {description}
          </CardDescription>
        )}
        <div className="mt-2">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", colorStyle.badge)}
          >
            {statusInfo.label} ({statusInfo.en})
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1 text-xs text-stone-500">
            <Target className="h-3 w-3" />
            {progressPercent}%
          </span>
          <span className="text-xs text-stone-400">
            {formattedTime} / {formattedTarget}
          </span>
        </div>
        <Progress value={progressPercent} className="w-full">
          <ProgressTrack>
            <ProgressIndicator className={cn("transition-all duration-500", colorStyle.progress)} />
          </ProgressTrack>
        </Progress>
      </CardContent>

      <CardFooter className="pt-2 border-t border-stone-100">
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <Clock className="h-3 w-3 text-stone-400" />
          <span>
            စုစုပေါင်း အချိန်: {formattedTime} (Total time: {formattedTime})
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
