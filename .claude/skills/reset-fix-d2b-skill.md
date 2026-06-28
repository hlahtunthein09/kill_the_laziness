# Skill: Reset Fix D2b — Red Reset Button + Confirmation Dialog in `TimerControls`

## Goal
Add a destructive red "Reset to Zero" button to `TimerControls` that shows a warning confirmation dialog before calling the zero-reset handler.

## Scope
- Modify only `components/timer/TimerControls.tsx`.
- Modify only `components/timer/__tests__/TimerControls.test.tsx`.

## Required Changes
1. In `components/timer/TimerControls.tsx`:
   - Add `onResetToZero: () => void` to `TimerControlsProps`.
   - Import the existing `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` from `@/components/ui/dialog`.
   - Add local state `isResetDialogOpen`.
   - Render a new destructive button (`variant="destructive"`) with the label `အချိန်ကို 0 မှ ပြန်စမယ် (Reset)`.
   - On click, open the confirmation dialog.
   - Dialog content:
     - Title: `သတိပေးချက် (Warning)`
     - Body: `ဒီခလုပ်ကို နှိပ်ရင် အခု focus လုပ်နေတဲ့ အခန်းကဏ်ဍ အတွက် run ခဲ့တဲ့ အချိန်အားလုံး ပျက်သွားမယ်။ ဒီလိုလုပ်ရမယ်ဆိုတာ သေချာလား?` / `This will erase all focus time for the current sub-piece. This action cannot be undone.`
     - Footer buttons:
       - `မလုပ်ပါ (Cancel)` — outline, closes dialog.
       - `ဟုတ်ကဲ့၊ 0 မှ ပြန်စမယ် (Yes, reset to zero)` — destructive, calls `onResetToZero()` and closes dialog.
2. In `components/timer/__tests__/TimerControls.test.tsx`:
   - Update existing tests if needed.
   - Add tests:
     - Clicking the red Reset button opens the confirmation dialog.
     - Clicking Cancel does not call `onResetToZero`.
     - Clicking Confirm calls `onResetToZero` exactly once.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerControls.test.tsx` passes.
- [ ] No files outside the scope are modified.
