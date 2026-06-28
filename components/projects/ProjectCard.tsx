"use client";

import { useMemo, useState } from "react";
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
import { AddSubPieceButton } from "./AddSubPieceButton";
import { SubPieceList } from "./SubPieceList";
import { useRouter } from "next/navigation";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  idle: { label: "မပြီးပြတ်သေးပါ", en: "Idle" },
  running: { label: "လုပ်ဆောင်နေသည်", en: "Running" },
  paused: { label: "ခဏရပ်ထား", en: "Paused" },
  completed: { label: "ပြီးစီး", en: "Completed" },
};

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-stone-100 text-stone-600 border-stone-200",
  running: "bg-teal-100 text-teal-700 border-teal-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const colorStyle = COLOR_MAP[project.color] ?? COLOR_MAP.mint;
  const statusInfo = STATUS_LABELS[project.status] ?? STATUS_LABELS.idle;
  const statusColor = STATUS_COLORS[project.status] ?? STATUS_COLORS.idle;

  const progressPercent = useMemo(() => {
    if (project.targetTimeSeconds <= 0) return 0;
    return Math.min(100, Math.round((project.totalTimeSeconds / project.targetTimeSeconds) * 100));
  }, [project.totalTimeSeconds, project.targetTimeSeconds]);

  const activeProjectId = useFocusStore((s) => s.activeProjectId);
  const setActiveProject = useFocusStore((s) => s.setActiveProject);
  const isActive = project.id === activeProjectId;
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formattedTime = useMemo(() => formatDuration(project.totalTimeSeconds), [project.totalTimeSeconds]);
  const formattedTarget = useMemo(() => formatDuration(project.targetTimeSeconds), [project.targetTimeSeconds]);

  const description = project.description?.trim();

  const isCompleted = project.status === "completed";

  const handleFocusClick = () => {
    if (isCompleted) {
      setIsDialogOpen(true);
    } else {
      setActiveProject(project.id);
      router.push("/timer");
    }
  };

  const handleRefocusConfirm = () => {
    useFocusStore.getState().updateProject(project.id, { status: "idle" });
    setActiveProject(project.id);
    router.push("/timer");
    setIsDialogOpen(false);
  };

  return (
    <Card className={cn(
      "group bg-card-glow hover:shadow-md transition-shadow duration-200",
      isActive && "ring-2 ring-teal-500 border-teal-500",
      !isActive && isCompleted && "border-emerald-500"
    )}>
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
        <div className="mt-2 flex flex-col items-start gap-1.5">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", statusColor)}
          >
            {statusInfo.label} ({statusInfo.en})
          </Badge>
          {isActive && (
            <Badge className="text-xs font-medium bg-teal-500 text-white">
              လက်ရှိ focus လုပ်နေသည် (Currently focusing)
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1 text-xs text-stone-500">
            <Target className="h-3 w-3" />
            {progressPercent}%
          </span>
          <span className="text-xs text-stone-500">
            <span className="font-semibold text-teal-600">{formattedTime}</span>
            <span className="text-stone-400"> / {formattedTarget}</span>
          </span>
        </div>
        <Progress value={progressPercent} className="w-full">
          <ProgressTrack>
            <ProgressIndicator className={cn("transition-all duration-500", colorStyle.progress)} />
          </ProgressTrack>
        </Progress>

        <div className="mt-3">
          <SubPieceList subPieces={project.subPieces} />
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-stone-100 flex flex-col gap-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500 w-full">
          <Clock className="h-3 w-3 text-stone-400" />
          <span>
            အသုံးပြုပြီးသောအချိန် (Time used):{" "}
            <span className="font-semibold text-teal-600">{formattedTime}</span>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFocusClick}
          className={cn(
            "text-xs gap-1 w-full whitespace-normal leading-tight h-auto py-2 hover:bg-teal-100 hover:text-teal-700 hover:border-teal-300",
            isActive && "border-teal-500 text-teal-700 bg-teal-50"
          )}
          aria-pressed={isActive}
        >
          <Crosshair className="h-3 w-3 shrink-0" />
          <span>ပရောဂျက်တစ်ခုလုံးကို focus လုပ်မယ် (Focus whole project)</span>
        </Button>
        <div className="w-full">
          <AddSubPieceButton projectId={project.id} className="w-full hover:bg-teal-100 hover:text-teal-700 hover:border-teal-300" />
        </div>
      </CardFooter>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ပရောဂျက်ပြီးစီးသွားပါပြီ (Project Completed)</DialogTitle>
            <DialogDescription>
              ဒီပရောဂျက်ကို ပြန်စ focus လုပ်ချင်ပါသလား?
              <br />
              This project is completed. Refocus will start a new session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              မလုပ်ပါ (Cancel)
            </Button>
            <Button onClick={handleRefocusConfirm}>
              focus လုပ်မယ် (Refocus)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
