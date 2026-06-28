# Skill: F3b — Rename Project-Level Focus Button

## Goal
Make the project-level focus button label clearly describe that it focuses the whole project, now that sub-pieces have their own focus buttons.

## Scope
- Modify only `components/projects/ProjectCard.tsx`.
- Modify only `components/projects/__tests__/ProjectCard.test.tsx`.

## Required Changes
1. In `components/projects/ProjectCard.tsx`:
   - Change the project focus button text from `ဤပရောဂျက်ကို focus လုပ်မယ် (Focus)` / `Focus` to `ပရောဂျက်တစ်ခုလုံးကို focus လုပ်မယ် (Focus whole project)`.
   - Keep the `Crosshair` icon and existing styling/behavior.
2. In `components/projects/__tests__/ProjectCard.test.tsx`:
   - Update any assertions that look for the old label text to match the new label.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/projects/__tests__/ProjectCard.test.tsx` passes.
- [ ] No files outside the scope are modified.
