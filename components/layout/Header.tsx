"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Flame, Zap, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b border-border px-4 lg:px-6",
        "bg-background"
      )}
    >
      {/* Left: Menu toggle + Logo + Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Toggle sidebar"
          data-testid="sidebar-toggle"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
          <Zap className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground leading-tight">
            FocusFlow AI
          </span>
        </div>
      </div>

      {/* Right: Streak */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1",
            "bg-amber-500/10 border border-amber-500/20 text-amber-600",
            "dark:bg-amber-400/10 dark:border-amber-400/20 dark:text-amber-400"
          )}
        >
          <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-semibold">5</span>
        </div>
      </div>
    </header>
  );
}
