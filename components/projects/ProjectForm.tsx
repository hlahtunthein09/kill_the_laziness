"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { cn } from "@/lib/utils";
import type { NatureColor } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLOR_OPTIONS: { value: NatureColor; label: string; dotClass: string }[] = [
  { value: "mint", label: "Mint", dotClass: "bg-teal-400" },
  { value: "ocean", label: "Ocean", dotClass: "bg-sky-400" },
  { value: "sand", label: "Sand", dotClass: "bg-amber-300" },
  { value: "forest", label: "Forest", dotClass: "bg-emerald-400" },
  { value: "coral", label: "Coral", dotClass: "bg-rose-400" },
];

export function ProjectForm({ open, onOpenChange }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<NatureColor>("mint");
  const [targetHours, setTargetHours] = useState<number>(8);
  const [errors, setErrors] = useState<{ name?: string; targetHours?: string }>({});

  const router = useRouter();
  const setActiveProject = useFocusStore((state) => state.setActiveProject);

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("mint");
    setTargetHours(8);
    setErrors({});
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: { name?: string; targetHours?: string } = {};

    if (!name.trim()) {
      newErrors.name = "ပရောဂျက်အမည် ထည့်ရန် လိုအပ်ပါသည်";
    }

    if (targetHours <= 0) {
      newErrors.targetHours = "လိုအပ်သော အချိန် 0.5 နာရီထက် ပိုရပါမည်";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const createdProject = useFocusStore.getState().addProject({
      name: name.trim(),
      description: description.trim(),
      color,
      targetTimeSeconds: targetHours * 3600,
    });

    setActiveProject(createdProject.id);
    router.push("/timer");

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ပရောဂျက်အသစ် ထည့်ရန် (Add New Project)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Project Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-name" className="text-sm font-medium">
              ပရောဂျက်အမည် (Project Name)
            </label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="ဥပမာ - E-Commerce Backend"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-desc" className="text-sm font-medium">
              အကြောင်းအရာ (Description)
            </label>
            <Textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ဥပမာ - Building the core API"
              rows={3}
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-color" className="text-sm font-medium">
              အရောင် (Color)
            </label>
            <Select value={color} onValueChange={(v) => setColor(v as NatureColor)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="flex items-center gap-2">
                      <span className={cn("size-3 rounded-full", c.dotClass)} />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Hours */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="target-hours" className="text-sm font-medium">
              လိုအပ်သော အချိန် နာရီ (Target Hours)
            </label>
            <Input
              id="target-hours"
              type="number"
              min={0.5}
              step={0.5}
              value={targetHours}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTargetHours(isNaN(val) ? 0 : val);
                if (errors.targetHours) setErrors((prev) => ({ ...prev, targetHours: undefined }));
              }}
              aria-invalid={!!errors.targetHours}
            />
            {errors.targetHours && (
              <p className="text-xs text-destructive">{errors.targetHours}</p>
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
