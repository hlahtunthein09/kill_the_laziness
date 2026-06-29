"use client";

import { useState } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { Pencil, Check } from "lucide-react";

export function DailyFocusGoalInput() {
  const settings = useFocusStore((s) => s.settings);
  const updateSettings = useFocusStore((s) => s.updateSettings);

  const value = settings.dailyFocusGoalMinutes ?? 60;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const handleConfirm = () => {
    let num = parseInt(draft, 10);
    if (Number.isNaN(num)) num = value;
    const clamped = Math.min(480, Math.max(15, num));
    if (clamped !== value) {
      updateSettings({ dailyFocusGoalMinutes: clamped });
    }
    setDraft(String(clamped));
    setIsEditing(false);
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground">
          နေ့စဉ် focus ရည်မှန်းချိန်
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Daily Focus Goal (in minutes)</p>
        <p className="text-sm text-muted-foreground mt-2">
          တစ်နေ့ focus လုပ်မယ့်အချိန် မိနစ်ဖြင့် သတ်မှတ်ပါ
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={15}
          max={480}
          step={5}
          value={draft}
          disabled={!isEditing}
          onChange={(e) => setDraft(e.target.value)}
          className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-right text-foreground shadow-sm disabled:bg-muted disabled:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Daily focus goal in minutes"
        />
        <button
          type="button"
          onClick={() => (isEditing ? handleConfirm() : setIsEditing(true))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-background text-foreground shadow-sm hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={isEditing ? "Confirm daily focus goal" : "Edit daily focus goal"}
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
