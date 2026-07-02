# Skill: Project Delete Button + Confirmation (Small Piece)

## Goal
Let users delete a project directly from `ProjectCard` with a confirmation dialog to prevent accidental deletion.

## Scope
- Modify ONLY `components/projects/ProjectCard.tsx` and add `components/projects/__tests__/ProjectCard.delete.test.tsx`.
- Do NOT touch the store, forms, or other files.

## Theme rule (MANDATORY)
- Support BOTH light and dark mode. Use semantic theme tokens ONLY.
  - Delete trigger: `text-muted-foreground hover:text-destructive hover:bg-destructive/10`.
  - Dialog: existing shadcn tokens.
- No hardcoded palette colors.

## Implementation (`components/projects/ProjectCard.tsx`)
1. Add imports:
   ```tsx
   import { Pencil, Trash2 } from "lucide-react";
   ```
2. Add local state:
   ```tsx
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   ```
3. Add `deleteProject` selector near other store selectors:
   ```tsx
   const deleteProject = useFocusStore((s) => s.deleteProject);
   ```
4. Add a small trash icon button in the card header, placed at the far right of the title row for discoverability. Use `ml-auto` to push it to the right:
   ```tsx
   <div className="flex items-center gap-2">
     <span className={cn("size-3 rounded-full shrink-0", colorStyle.dot)} />
     <CardTitle className="text-base font-semibold text-foreground truncate">
       {project.name}
     </CardTitle>
     <button
       type="button"
       onClick={() => setIsTargetDialogOpen(true)}
       className="..."
       aria-label="ပစ်မှတ်အချိန် ပြင်ရန် (Edit target)"
     >
       <Pencil className="h-3.5 w-3.5" />
     </button>
     <button
       type="button"
       onClick={() => setIsDeleteDialogOpen(true)}
       className="ml-auto inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
       aria-label="ပရောဂျက်ဖျက်ရန် (Delete project)"
     >
       <Trash2 className="h-4 w-4" />
     </button>
   </div>
   ```
   - Keep the pencil button where it is; the trash button goes to the far right (`ml-auto`).
   - If the title row gets crowded on small screens, the `truncate` on the title + `shrink-0` icons should handle it.
5. Add a second confirmation Dialog at the bottom (after the target-edit dialog):
   ```tsx
   <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
     <DialogContent className="sm:max-w-md">
       <DialogHeader>
         <DialogTitle>ပရောဂျက်ဖျက်ရန်သေချာပါသလား? (Delete Project?)</DialogTitle>
         <DialogDescription>
           {project.name} နှင့် အခန်းကဏ်းအားလုံးကို ဖျက်မှာ သေချာပါသလား။ ဒါကိုပြန်လှန်လို့မရပါ။
           <br />
           This will permanently delete "{project.name}" and all its sub-pieces.
         </DialogDescription>
       </DialogHeader>
       <DialogFooter>
         <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
           မလုပ်ပါ (Cancel)
         </Button>
         <Button
           variant="destructive"
           onClick={() => {
             deleteProject(project.id);
             setIsDeleteDialogOpen(false);
           }}
         >
           ဖျက်မယ် (Delete)
         </Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
   ```

## Tests (`components/projects/__tests__/ProjectCard.delete.test.tsx`)
Use existing ProjectCard mock style. Add tests:
- Renders delete button (trash aria-label).
- Clicking delete button opens confirmation dialog with project name.
- Clicking Cancel closes dialog without calling `deleteProject`.
- Clicking Delete calls `deleteProject(project.id)` and closes dialog.

## Verify (piece NOT done until ALL pass)
- `npx tsc --noEmit`
- `npx vitest run components/projects/__tests__/ProjectCard.delete.test.tsx`
- `npx vitest run components/projects/__tests__/ProjectCard.test.tsx components/projects/__tests__/ProjectCard.status.test.tsx components/projects/__tests__/ProjectCard.target-edit.test.tsx`

## Done criteria
Delete button visible in card header, confirmation dialog prevents accidents, deletion calls store action, all ProjectCard suites still pass.
