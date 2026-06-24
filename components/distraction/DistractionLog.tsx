"use client";

import { useFocusStore } from "@/lib/store/useFocusStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ယခုလတ်တလော (Just now)";
  if (minutes < 60) return `${minutes} မိနစ်အကြာက (${minutes}m ago)`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} နာရီအကြာက (${hours}h ago)`;
  return `${Math.floor(hours / 24)} ရက်အကြာက (${Math.floor(hours / 24)}d ago)`;
}

export function DistractionLog({ className }: { className?: string }) {
  const logs = useFocusStore((state) => state.logs);
  const clearLogs = useFocusStore((state) => state.clearLogs);

  return (
    <Card className={cn("bg-card-glow", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 text-stone-500">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          အာရုံစားသမျှမှတ်တမ်း
        </CardDescription>
        <CardTitle className="text-lg font-bold text-stone-900">Distraction Log</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-stone-500">အခုထိ အာရုံစားမှု မရှိသေးပါ (No distractions logged yet)</p>
        ) : (
          <ul className="space-y-2 mb-3">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[60%] text-stone-700" title={log.url}>
                  {log.url}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  log.action === "blocked" ? "text-red-500" : "text-amber-500"
                )}>
                  {log.action === "blocked" ? "တားမြစ်ခဲ့သည် (Blocked)" : "သတိပေးခဲ့သည် (Warned)"}
                </span>
                <span className="text-xs text-stone-400 whitespace-nowrap">{timeAgo(log.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
        {logs.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearLogs} className="text-stone-600">
            <Trash2 className="h-3 w-3 mr-1" />
            မှတ်တမ်းရှင်းလင်းရန် (Clear)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
