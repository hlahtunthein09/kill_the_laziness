# Skill: Fix Corrupted Burmese Label in ProjectForm

## Goal
Fix the garbled Burmese text in the Target Hours label and error message in `ProjectForm`.

## Scope
- Modify only `components/projects/ProjectForm.tsx`.
- Modify only `components/projects/__tests__/ProjectForm.test.tsx` if it asserts the exact label text.

## Required Changes
1. In `components/projects/ProjectForm.tsx`:
   - Change the Target Hours label from `လক্ষ্য঑ားအချိန် နာရီ (Target Hours)` to `လိုအပ်သော အချိန် နာရီ (Target Hours)`.
   - Change the validation error message from `လক্ষ্য঑ားအချိန် 0.5 နာရီထက် ပိုရပါမည်` to `လိုအပ်သော အချိန် 0.5 နာရီထက် ပိုရပါမည်`.
2. In `components/projects/__tests__/ProjectForm.test.tsx`:
   - Update any assertions that query the old corrupted label text.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/projects/__tests__/ProjectForm.test.tsx` passes.
- [ ] No files outside the scope are modified.
