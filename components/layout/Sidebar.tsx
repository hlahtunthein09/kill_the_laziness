"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Timer,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  burmeseLabel: string;
  englishLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: "/",
    burmeseLabel: "ပင်မ",
    englishLabel: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/projects",
    burmeseLabel: "ပရောဂျက်များ",
    englishLabel: "Projects",
    icon: FolderKanban,
  },
  {
    href: "/timer",
    burmeseLabel: "အချိန်မှတ်",
    englishLabel: "Timer",
    icon: Timer,
  },
  {
    href: "/settings",
    burmeseLabel: "ဆက်တင်များ",
    englishLabel: "Settings",
    icon: Settings,
  },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand / Title */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          FF
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-foreground truncate">
            FocusFlow AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 transition-colors",
                    collapsed ? "justify-center" : "gap-3",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={collapsed ? `${item.burmeseLabel} (${item.englishLabel})` : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight truncate">
                        {item.burmeseLabel}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        {item.englishLabel}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar footer */}
      {!collapsed && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground/60">
            FocusFlow AI v0.1
          </div>
        </div>
      )}
    </div>
  );
}
