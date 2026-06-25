"use client";

import { useFocusStore } from "@/lib/store/useFocusStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakCounter({ className }: { className?: string }) {
  const currentStreak = useFocusStore((state) => state.settings.currentStreak) ?? 0;
  const longestStreak = useFocusStore((state) => state.settings.longestStreak) ?? 0;

  return (
    <Card className={cn("bg-card-glow", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 text-stone-500">
          <Flame className="h-4 w-4 text-orange-500" />
          အစဉ်လိုက် focus ရက်များ (Streak)
        </CardDescription>
        <CardTitle className="text-3xl font-bold text-stone-900">
          {currentStreak}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-stone-400">
          စံချိန်: {longestStreak} ရက် (Best: {longestStreak})
        </p>
      </CardContent>
    </Card>
  );
}
