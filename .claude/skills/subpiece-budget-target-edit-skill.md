# Skill: Sub-piece Budget — Project Target Edit (Piece C)

## Goal
Let users raise (or lower, floored by allocated sum) a project's target time directly from `ProjectCard`. Closes the budget loop: when remaining budget is too small, users can edit the target hours instead of being blocked.

## Scope
- Modify ONLY `components/projects/ProjectCard.tsx` and add `components/projects/__tests__/ProjectCard.target-edit.test.tsx`.
- Do NOT touch the store, SubPieceForm, or other files.

## Theme rule (MANDATORY)
- Support BOTH light and dark mode. Use semantic theme tokens ONLY.
  - Edit icon button: `text-muted-foreground hover:text-primary`.
  - Dialog, inputs, labels, helper, buttons: reuse existing shadcn tokens (`text-foreground`, `text-muted-foreground`, `bg-background`, `border-border`, etc.).
- Do not introduce literal palette classes beyond existing `COLOR_MAP` / `STATUS_COLORS`.

## Implementation (`components/projects/ProjectCard.tsx`)
1. Add imports at top:
   ```tsx
   import { Pencil } from "lucide-react";
   import { Input } from "@/components/ui/input";
   import { Label } from "@/components/ui/label";
   ```
   If `Label` isn't available, use a plain `<label className="text-sm font-medium">`.
2. Add local state:
   ```tsx
   const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
   const [targetHours, setTargetHours] = useState(() => project.targetTimeSeconds / 3600);
   ```
   Reset `targetHours` when dialog opens to keep it in sync with the current project target:
   - Use a `useEffect` keyed on `[project.targetTimeSeconds, isTargetDialogOpen]`:
     ```tsx
     useEffect(() => {
       if (isTargetDialogOpen) setTargetHours(project.targetTimeSeconds / 3600);
     }, [isTargetDialogOpen, project.targetTimeSeconds]);
     ```
3. Compute the minimum allowed hours from allocated sub-pieces:
   ```tsx
   const allocatedHours = useMemo(() => {
     return project.subPieces.reduce((sum, sp) => sum + sp.allocatedMinutes, 0) / 60;
   }, [project.subPieces]);
   ```
4. Place a small edit icon next to the target display (around the existing `formattedTime / formattedTarget` block):
   ```tsx
   <span className="text-xs text-muted-foreground flex items-center gap-1">
     <span className="font-semibold text-primary">{formattedTime}</span>
     <span>/ {formattedTarget}</span>
     <button
       type="button"
       onClick={() => setIsTargetDialogOpen(true)}
       className="inline-flex items-center justify-center rounded-sm p-0.5 text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
       aria-label="ပစ်မှတ်အချိန် ပြင်ရန် (Edit target)"
     >
       <Pencil className="h-3 w-3" />
     </button>
   </span>
   ```
5. Add a second Dialog at the bottom of the card (after the existing completion-refocus dialog):
   ```tsx
   <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
     <DialogContent className="sm:max-w-md">
       <DialogHeader>
         <DialogTitle>ပစ်မှတ်အချိန် ပြင်ရန် (Edit Target)</DialogTitle>
         <DialogDescription>
           ပရောဂျက်အတွက် ပစ်မှတ်အချိန်ကို အနည်းဆုံး {allocatedHours} နာရီအထိ ထားရပါမည်။
           <br />
           Target must be at least {allocatedHours}h because sub-pieces already use that time.
         </DialogDescription>
       </DialogHeader>

       <form
         onSubmit={(e) => {
           e.preventDefault();
           const hours = Number.isFinite(targetHours) ? targetHours : allocatedHours;
           const next = Math.max(allocatedHours, Math.round(hours * 10) / 10);
           useFocusStore.getState().updateProject(project.id, {
             targetTimeSeconds: Math.round(next * 3600),
           });
           setIsTargetDialogOpen(false);
         }}
         className="flex flex-col gap-4 py-2"
       >
         <div className="flex flex-col gap-1.5">
           <Label htmlFor="target-hours">ပစ်မှတ်အချိန် (နာရီ) / Target (hours)</Label>
           <Input
             id="target-hours"
             type="number"
             step={0.5}
             min={allocatedHours}
             value={targetHours}
             onChange={(e) => setTargetHours(parseFloat(e.target.value))}
           />
           <p className="text-xs text-muted-foreground">
             Allocated from sub-pieces: {allocatedHours}h
           </p>
         </div>

         <DialogFooter>
           <Button type="button" variant="outline" onClick={() => setIsTargetDialogOpen(false)}>
             ပယ်ဖျက်ရန် (Cancel)
           </Button>
           <Button type="submit">သိမ်းဆည်းရန် (Save)</Button>
         </DialogFooter>
       </form>
     </DialogContent>
   </Dialog>
   ```
   Notes:
   - Round to 1 decimal place (`Math.round(hours * 10) / 10`) so the input stays tidy.
   - `Math.max(allocatedHours, ...)` is a UI-level guard; the store also floors (Piece A), so the invariant is defense-in-depth.
   - `targetHours` default / reset should reflect current target; if user types below allocated, it gets floored on save.

## Tests (`components/projects/__tests__/ProjectCard.target-edit.test.tsx`)
Use the existing ProjectCard test style (mock next/navigation, mock useFocusStore, render with a project). Add tests:
- Renders edit target button (pencil aria-label).
- Clicking pencil opens the target edit dialog.
- Saving a higher target calls `updateProject` with `targetTimeSeconds = newHours * 3600`.
- Entering below allocated hours is floored: e.g. project with 40 min allocated (0.666...h), enter 0.5h, save → `updateProject` called with 2400s.

## Verify (piece NOT done until both pass)
- `npx tsc --noEmit`
- `npx vitest run components/projects/__tests__/ProjectCard.target-edit.test.tsx`
- Also run `npx vitest run components/projects/__tests__/ProjectCard.test.tsx components/projects/__tests__/ProjectCard.status.test.tsx` to ensure existing ProjectCard tests still pass.

## Done criteria
Target edit dialog opens from ProjectCard, saves hours→seconds correctly, floors below allocated sum, renders correctly in light/dark themes, all relevant tests pass.
