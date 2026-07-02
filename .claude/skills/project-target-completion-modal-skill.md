# Skill: Project Target Completion Modal (Piece B)

## Goal
Replace the inline `SessionSummary` card for project target completion with a modal dialog, using an English-only "continue" button for clarity.

## Scope
- Modify `components/timer/CompletionDialog.tsx` to support a project-target mode.
- Modify `components/timer/TimerPanel.tsx` to use the dialog for project target completion.
- Update tests: `CompletionDialog.test.tsx`, `TimerPanel.session-summary.test.tsx`.
- Do NOT touch extension notifications (Piece C deferred).

## Design
Project target completion modal:
- Title: `"ပရောဂျက်ပစ်မှတ် ရောက်ရှိ (Project Target Reached)"`
- Project name
- Total focused time (capped at target)
- XP gained
- Single button: `"continue"` (English only, lowercase as requested)

## Implementation

### `components/timer/CompletionDialog.tsx`
Add an optional `mode` prop:
```tsx
type CompletionMode = "sub-piece" | "project";

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  subPieceName?: string;
  elapsedSeconds: number;
  allocatedMinutes: number;
  xpGained: number;
  mode?: CompletionMode;
  onAddSubPiece?: () => void;
  onContinueProject?: () => void;
}
```

- If `mode === "project"` (or no subPieceName/onAddSubPiece):
  - Title: `"ပရောဂျက်ပစ်မှတ် ရောက်ရှိ (Project Target Reached)"`
  - Show project name without sub-piece label.
  - Show focused time and XP.
  - Single footer button `"continue"` that calls `onContinueProject` (or `onOpenChange(false)` if no handler).
- If `mode === "sub-piece"`, keep existing two-button layout.

### `components/timer/TimerPanel.tsx`
- For project target completion (`showSummary && !completedSubPiece`):
  - Render `CompletionDialog` with `mode="project"`.
  - Pass `onContinueProject={() => { reinitialize(); setShowSummary(false); }}`.
- Remove the old `SessionSummary` inline block for project target completion (keep `SessionSummary` import if sub-piece path still uses it, otherwise remove).

### Labels
- Continue button English only: `"continue"`.

## Tests
### `CompletionDialog.test.tsx`
- Add test for project mode: renders project title, shows project name/time/XP, single "continue" button.
- Keep sub-piece mode tests.

### `TimerPanel.session-summary.test.tsx`
- Update project target completion test to assert `CompletionDialog` renders in project mode with "continue" button.

## Verify (piece NOT done until all pass)
- `npx tsc --noEmit`
- `npx vitest run components/timer/__tests__/CompletionDialog.test.tsx components/timer/__tests__/TimerPanel.session-summary.test.tsx components/timer/__tests__/TimerPanel.test.tsx`

## Done criteria
Project target completion shows a modal with English "continue" button, sub-piece modal still works, all tests pass.
