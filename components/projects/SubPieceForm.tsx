"use client";

import { useState } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SubPieceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function SubPieceForm({ open, onOpenChange, projectId }: SubPieceFormProps) {
  const [name, setName] = useState("");
  const [allocatedMinutes, setAllocatedMinutes] = useState<number>(25);
  const [errors, setErrors] = useState<{ name?: string; allocatedMinutes?: string }>({});

  const resetForm = () => {
    setName("");
    setAllocatedMinutes(25);
    setErrors({});
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: { name?: string; allocatedMinutes?: string } = {};

    if (!name.trim()) {
      newErrors.name = "အခန်းကဏ္ဍအမည် ထည့်ရန် လိုအပ်ပါသည်";
    }

    if (!allocatedMinutes || allocatedMinutes <= 0 || !Number.isInteger(allocatedMinutes)) {
      newErrors.allocatedMinutes = "ခဏထားချိန် မိနစ် 1 နှင့် အထက်ဖြစ်ရပါမည်";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const project = useFocusStore.getState().getProjectById(projectId);
    const order = project?.subPieces.length ?? 0;

    useFocusStore.getState().addSubPiece({
      projectId,
      name: name.trim(),
      allocatedMinutes,
      order,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>အခန်းကဏ္ဍအသစ် ထည့်ရန် (Add New Sub-piece)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Sub-piece Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="subpiece-name" className="text-sm font-medium">
              အခန်းကဏ္ဍအမည် (Sub-piece Name)
            </label>
            <Input
              id="subpiece-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="ဥပမာ - API Design"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Allocated Minutes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="allocated-minutes" className="text-sm font-medium">
              ခဏထားချိန် မိနစ် (Allocated Minutes)
            </label>
            <Input
              id="allocated-minutes"
              type="number"
              value={allocatedMinutes}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setAllocatedMinutes(isNaN(val) ? 0 : val);
                if (errors.allocatedMinutes) setErrors((prev) => ({ ...prev, allocatedMinutes: undefined }));
              }}
              aria-invalid={!!errors.allocatedMinutes}
            />
            {errors.allocatedMinutes && (
              <p className="text-xs text-destructive">{errors.allocatedMinutes}</p>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              ပယ်ဖျက်ရန် (Cancel)
            </Button>
            <Button type="submit">သိမ်းဆည်းရန် (Save)</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
