"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

const MD_BREAKPOINT = 768;

export function AppShell({ children }: AppShellProps) {
  // Default to open on larger screens; close on small screens after hydration.
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < MD_BREAKPOINT) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className={cn("flex h-screen w-full overflow-hidden bg-background")}>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-backdrop"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-border bg-sidebar backdrop-blur-sm transition-all duration-200",
          "fixed inset-y-0 left-0 z-50 md:static",
          "overflow-hidden",
          sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-16 md:translate-x-0"
        )}
      >
        <Sidebar collapsed={!sidebarOpen} />
      </aside>

      {/* Main content area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
