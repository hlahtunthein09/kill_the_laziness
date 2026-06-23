"use client";

import { useState } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_PROJECT_NAME = "အထွေထွေ focus (General Focus)";
const PLACEHOLDER = "အခု focus လုပ်မယ့် အလုပ် ဘာလဲ? (What will you focus on?)";

export function QuickFocusInput({ onStart }: { onStart?: () => void }) {
  const [text, setText] = useState("");
  const projects = useFocusStore((s) => s.projects);
  const activeProjectId = useFocusStore((s) => s.activeProjectId);
  const addProject = useFocusStore((s) => s.addProject);
  const addSubPiece = useFocusStore((s) => s.addSubPiece);
  const setActiveProject = useFocusStore((s) => s.setActiveProject);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetProject = projects.find((p) => p.id === activeProjectId);

    if (!targetProject) {
      targetProject = addProject({
        name: DEFAULT_PROJECT_NAME,
        description: "",
        color: "mint",
        targetTimeSeconds: 3600,
      });
    }

    const name = text.trim() || DEFAULT_PROJECT_NAME;
    addSubPiece({
      projectId: targetProject.id,
      name,
      allocatedMinutes: 25,
      order: targetProject.subPieces.length,
    });

    setActiveProject(targetProject.id);
    setText("");
    onStart?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        className="flex-1"
        data-testid="quick-focus-input"
      />
      <Button
        type="submit"
        disabled={!text.trim()}
        className={cn(
          "gap-1",
          text.trim() ? "bg-teal-500 hover:bg-teal-600" : ""
        )}
        data-testid="quick-focus-start"
      >
        <Play className="h-4 w-4" />
        <span className="hidden sm:inline">စတင်မယ် (Start)</span>
        <span className="sm:hidden">စတင်မယ်</span>
      </Button>
    </form>
  );
}
