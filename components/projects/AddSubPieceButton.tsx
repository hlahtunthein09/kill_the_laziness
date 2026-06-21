"use client";

import { useState } from "react";
import { SubPieceForm } from "./SubPieceForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddSubPieceButtonProps {
  projectId: string;
  className?: string;
}

export function AddSubPieceButton({ projectId, className }: AddSubPieceButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-1", className)}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        အခန်းကဏ္ဍအသစ်ထည့်ရန် (Add Sub-piece)
      </Button>
      <SubPieceForm open={open} onOpenChange={setOpen} projectId={projectId} />
    </>
  );
}
