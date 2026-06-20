"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={cn("flex h-screen w-full overflow-hidden bg-background")}>
      {/* Sidebar — hidden on mobile, fixed width on desktop */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-teal-50/80 backdrop-blur-sm md:flex",
          "w-16 lg:w-64"
        )}
      >
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header — visible on all screen sizes */}
        <Header />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
