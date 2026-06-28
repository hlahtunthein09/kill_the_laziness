# Skill: G2c — Completed Project Refocus Confirmation

## Goal
Add a confirmation dialog when the user tries to refocus a completed project, then reset the project status to idle and navigate to the timer.

## Scope
- Modify only `components/projects/ProjectCard.tsx`.
- Modify only `components/projects/__tests__/ProjectCard.test.tsx`.

## Required Changes
1. In `components/projects/ProjectCard.tsx`:
   - Import dialog primitives from `@/components/ui/dialog`.
   - Add local state `isDialogOpen`.
   - In the project focus button `onClick`:
     - If `project.status === "completed"`, open the confirmation dialog.
     - Otherwise, keep the existing direct focus behavior.
   - Dialog content:
     - Title: `ပရောဂျက်ပြီးစီးသွားပါပြီ (Project Completed)`
     - Body: `ဒီပရောဂျက်ကို ပြန်စ focus လုပ်ချင်ပါသလား?` / `This project is completed. Refocus will start a new session.`
     - Footer buttons:
       - `မလုပ်ပါ (Cancel)` — closes dialog.
       - `focus လုပ်မယ် (Refocus)` — calls `useFocusStore.getState().updateProject(project.id, { status: "idle" })`, then `setActiveProject(project.id)`, then `router.push("/timer")`.
2. In `components/projects/__tests__/ProjectCard.test.tsx`:
   - Add tests:
     - Clicking focus on a completed project opens the confirmation dialog.
     - Cancel does not change project status or navigate.
     - Confirm sets project status to idle, sets active project, and navigates.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/projects/__tests__/ProjectCard.test.tsx` passes.
- [ ] No files outside the scope are modified.
