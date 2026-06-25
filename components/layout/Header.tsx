"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Flame, Zap } from "lucide-react";

export function Header() {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b border-border px-4 lg:px-6",
        "bg-white/80 backdrop-blur-sm"
      )}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white font-bold text-sm shadow-sm">
          <Zap className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-stone-900 leading-tight">
            FocusFlow AI
          </span>
        </div>
      </div>

      {/* Right: Streak */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1",
            "bg-amber-50 border border-amber-200 text-amber-700"
          )}
        >
          <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-semibold">5</span>
        </div>
      </div>
    </header>
  );
}
