# Skill: Sub-piece Completion Modal (Piece A)

## Goal
Replace the inline `SessionSummary` card with a modal dialog when a sub-piece completes. Let the user choose between adding another sub-piece or continuing project-level focus.

## Scope
- Modify `components/timer/TimerPanel.tsx`.
- Create `components/timer/CompletionDialog.tsx`.
- Create `components/timer/__tests__/CompletionDialog.test.tsx`.
- Update `components/timer/__tests__/TimerPanel.session-summary.test.tsx`.
- Do NOT touch extension notifications (Piece C deferred).

## Design
Modal content on sub-piece completion:
- Title: `"အခန်းကဏ္ဍ ပြီးစီး (Sub-piece Complete)"`
- Sub-piece name + project name
- XP gained
- Two buttons:
  1. `"အခန်းကဏ္ဍအသစ်ထည့်ရန် (Add another sub-piece)"` — opens `SubPieceForm` for the active project.
  2. `"{projectName} ကို ဆက်လက်ပြီး focus လုပ်မယ် (Continue focusing {projectName})"` — dismisses dialog and switches to project-only focus.

## Implementation

### `components/timer/CompletionDialog.tsx`
Props:
```tsx
interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  subPieceName: string;
  elapsedSeconds: number;
  allocatedMinutes: number;
  xpGained: number;
  onAddSubPiece: () => void;
  onContinueProject: () => void;
}
```

Use shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `Button`.
Use theme tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`).
Show:
- `CheckCircle2` icon + title
- `Target` icon + `{projectName} — {subPieceName}`
- `Clock` icon + `Focused: {formatDuration(elapsedSeconds)} / {allocatedMinutes}m allocated`
- `Sparkles` icon + `XP gained: +{xpGained}`
- Two buttons side by side in footer.

### `components/timer/TimerPanel.tsx`
1. Replace the `SessionSummary` inline block with `<CompletionDialog ... />`.
2. Add state for sub-piece form:
   ```tsx
   const [isSubPieceFormOpen, setIsSubPieceFormOpen] = useState(false);
   ```
3. Import `SubPieceForm` and `AddSubPieceButton` (or just `SubPieceForm`).
4. `handleAddSubPiece`:
   - Close completion dialog (`setShowSummary(false)`)
   - Open sub-piece form (`setIsSubPieceFormOpen(true)`)
5. `handleContinueProject`:
   - Call `useFocusStore.getState().setActiveProject(activeProject.id)` to switch to project-only focus (this sets `projectOnlyFocus` true and clears activeSubPieceId).
   - Call `reinitialize()` to reset timer display to current store state.
   - Close completion dialog (`setShowSummary(false)`).
6. Render `SubPieceForm` at the bottom:
   ```tsx
   <SubPieceForm
     open={isSubPieceFormOpen}
     onOpenChange={(open) => {
       setIsSubPieceFormOpen(open);
       if (!open) {
         // If user cancelled without adding, completion dialog stays closed.
       }
     }}
     projectId={activeProject.id}
   />
   ```
7. Keep `handleComplete` setting `showSummary(true)` and `toastTrigger("complete")`.

### Notes
- `setActiveProject` already sets `projectOnlyFocus: true` and `activeSubPieceId: null` in the store.
- After adding a new sub-piece via `SubPieceForm`, `TimerPanel`'s `resolvedSubPiece` will automatically pick the new incomplete sub-piece on next render.

## Tests
### `CompletionDialog.test.tsx`
- Renders dialog when open.
- Shows project name, sub-piece name, elapsed time, allocated minutes, XP.
- Calls `onAddSubPiece` when Add button clicked.
- Calls `onContinueProject` when Continue button clicked.

### `TimerPanel.session-summary.test.tsx`
- Update existing tests: assert `CompletionDialog` renders instead of `SessionSummary`.
- Add test: clicking "Add another sub-piece" opens `SubPieceForm`.
- Add test: clicking "Continue project focus" calls `setActiveProject` and `reinitialize`.

## Verify (piece NOT done until all pass)
- `npx tsc --noEmit`
- `npx vitest run components/timer/__tests__/CompletionDialog.test.tsx components/timer/__tests__/TimerPanel.session-summary.test.tsx components/timer/__tests__/TimerPanel.test.tsx`

## Done criteria
Sub-piece completion shows a modal with add/continue choices, theme-safe styling, all tests pass.
