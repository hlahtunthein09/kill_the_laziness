# Skill: Navigate to Timer After Creating a Project

## Goal
Fix the UX gap where creating a project leaves the user on the same page. After a project is created, set it as active and navigate to `/timer` so the user can start focusing immediately.

## Scope
- Modify only `components/projects/ProjectForm.tsx`.
- Modify only `components/projects/__tests__/ProjectForm.test.tsx`.

## Required Changes
1. In `components/projects/ProjectForm.tsx`:
   - Import `useRouter` from `next/navigation`.
   - Read `setActiveProject` from `useFocusStore`.
   - In `handleSubmit`, after `addProject` succeeds:
     - Capture the returned project object.
     - Call `setActiveProject(createdProject.id)`.
     - Call `router.push("/timer")`.
   - Keep the existing `handleClose` call so the dialog closes.
2. In `components/projects/__tests__/ProjectForm.test.tsx`:
   - Add `setActiveProject` to the mocked store.
   - Add a test that verifies submitting the form calls `setActiveProject` with the new project ID and navigates to `/timer`.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/projects/__tests__/ProjectForm.test.tsx` passes.
- [ ] No files outside the scope are modified.
