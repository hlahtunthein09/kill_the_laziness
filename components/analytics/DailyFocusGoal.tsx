"use client";

import { useFocusStore } from "@/lib/store/useFocusStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

export function DailyFocusGoal({ className }: { className?: string }) {
  const todayFocusSeconds = useFocusStore((state) => state.settings.todayFocusSeconds) ?? 0;
  const dailyFocusGoalMinutes = useFocusStore(
    (state) => state.settings.dailyFocusGoalMinutes
  ) ?? 60;

  const todayMinutes = Math.floor(todayFocusSeconds / 60);
  const goalMinutes = dailyFocusGoalMinutes;
  const progress =
    goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0;

  return (
    <Card className={cn("bg-card-glow", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 text-muted-foreground">
          <Target className="h-4 w-4 text-primary" />
          နေ့စဉ် focus ရည်မှန်းချက်
        </CardDescription>
        <CardTitle className="text-3xl font-bold text-foreground">
          {todayMinutes} / {goalMinutes}{" "}
          <span className="text-lg font-normal text-muted-foreground">မိနစ်</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-muted rounded-full h-2.5 mb-2">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            data-testid="progress-fill"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {progress}% achieved
          {progress >= 100 && " (Goal reached)"}
        </p>
      </CardContent>
    </Card>
  );
}
