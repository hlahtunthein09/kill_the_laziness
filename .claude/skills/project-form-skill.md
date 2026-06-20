# Skill: Project Form Only Build

## Purpose
Create a dialog form for adding new projects to FocusFlow AI.

## Piece Scope
This is **Piece 3a** of the Project Management phase. It only handles ADDING projects, not listing them.

## References Studied

### shadcn/ui Dialog + Form (Context7 `/shadcn-ui/ui`)
Source: https://github.com/shadcn-ui/ui/blob/main/ui/apps/v4/registry/new-york-v4/ui/form.tsx

shadcn/ui Form wraps react-hook-form Controller:

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Zustand Store Actions in Forms (Context7 `/pmndrs/zustand`)
Source: https://github.com/pmndrs/zustand/blob/main/docs/reference/apis/create.md

```tsx
const addProject = useFocusStore((state) => state.addProject)

const handleSubmit = (data) => {
  addProject(data)
}
```

## Files

### Create
- `components/projects/ProjectForm.tsx`

## Steps

1. Read `.claude/CLAUDE.md`, `.claude/memory/conventions.md`, and current store slice.
2. Read `lib/store/slices/projectSlice.ts` to understand `addProject` action signature.
3. Create `components/projects/ProjectForm.tsx` as client component.
4. Use shadcn Dialog, Button, Input, Label, Select components.
5. Build form fields:
   - Name (required, text input)
   - Description (optional, textarea)
   - Color (select: mint, ocean, sand, forest, coral)
   - Target time in hours (number input, convert to seconds for store)
6. On submit, call `useFocusStore.addProject()` with generated id and current timestamp.
7. Close dialog after successful submit.
8. Run `npx tsc --noEmit`.
9. Run `npm run dev` briefly.
10. Update `.claude/memory/progress.md`.

## Rules

- Client component (`"use client"`).
- Burmese labels first, English in parentheses.
  - "ပရောဂျက်အမည် (Project Name)"
  - "အကြောင်းအရာ (Description)"
  - "အရောင် (Color)"
  - "লক্ষ্য঑ားအချိန် နာရီ (Target Hours)"
- Use `generateId()` from `lib/utils.ts`.
- Convert target hours to seconds before storing.
- Validate: name is required, target hours must be positive number.
- Do NOT create ProjectList or ProjectCard in this piece.
- Do NOT create `/projects` page in this piece.

## Verification

- TypeScript compiles.
- Dev server starts.
- Dialog opens/closes.
- Submitting form adds project to `useFocusStore`.
- Project persists to localStorage.

## Virtual Sizing
- **Small**: 1 new file, ~100 lines.
