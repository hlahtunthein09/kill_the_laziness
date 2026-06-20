"use client";

import { useState } from "react";
import { ProjectForm } from "./ProjectForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddProjectButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  label?: string;
  sublabel?: string;
}

export function AddProjectButton({
  variant = "default",
  size = "default",
  className,
  label = "ပရောဂျက်အသစ်ထည့်ရန်",
  sublabel = "Add a new project",
}: AddProjectButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        {label} ({sublabel})
      </Button>
      <ProjectForm open={open} onOpenChange={setOpen} />
    </>
  );
}
