# Skill: Project Card + List + Page Build

## Purpose
Display projects in a list/grid of cards on a dedicated `/projects` page, and wire the dashboard "Add Project" button to the existing ProjectForm.

## Piece Scope
This is **Piece 3b** of the Project Management phase. It only handles DISPLAYING projects, not the form (which is Piece 3a).

## References Studied

### shadcn/ui Card for Item Display (Context7 `/shadcn-ui/ui`)
Source: https://github.com/shadcn-ui/ui/blob/main/apps/v4/app/(app)/examples/dashboard/components/section-cards.tsx

```tsx
<Card className="@container/card">
  <CardHeader>
    <CardDescription>Total Revenue</CardDescription>
    <CardTitle className="text-2xl font-semibold">$1,250.00</CardTitle>
    <CardAction>
      <Badge variant="outline">+12.5%</Badge>
    </CardAction>
  </CardHeader>
  <CardFooter className="flex-col items-start gap-1.5 text-sm">
    <div>Trending up this month</div>
  </CardFooter>
</Card>
```

### Zustand Selectors (Context7 `/pmndrs/zustand`)
Source: https://github.com/pmndrs/zustand/blob/main/docs/learn/guides/beginner-typescript.md

```tsx
const projects = useFocusStore((s) => s.projects)
const activeProjectId = useFocusStore((s) => s.activeProjectId)
```

### Next.js App Router Page (Context7 `/vercel/next.js`)
Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/01-getting-started/03-layouts-and-pages.mdx

Create a route by adding `app/projects/page.tsx`.

## Files

### Create
- `components/projects/ProjectCard.tsx`
- `components/projects/ProjectList.tsx`
- `app/projects/page.tsx`

### Modify
- `app/page.tsx` — wire "Add New Project" button to open ProjectForm dialog

## Steps

1. Read `.claude/CLAUDE.md`, `.claude/memory/conventions.md`.
2. Read `lib/types/index.ts` and `lib/store/slices/projectSlice.ts`.
3. Read existing `components/projects/ProjectForm.tsx`.
4. Create `ProjectCard.tsx`:
   - Props: `project: Project`
   - Show: color indicator, name, description, target time, total time, progress bar
   - Use shadcn Card, Progress, Badge
   - Burmese labels + English secondary
5. Create `ProjectList.tsx`:
   - Read `projects` from `useFocusStore`
   - Render grid of `ProjectCard`
   - Empty state: "ပရောဂျက်များ မရှိသေးပါ" (No projects yet)
6. Create `app/projects/page.tsx`:
   - Server Component
   - Render page title + "Add Project" button + ProjectList
   - Button opens ProjectForm dialog (client wrapper needed)
7. Update `app/page.tsx`:
   - Make "Add New Project" button functional by importing ProjectForm and managing dialog state
8. Run `npx tsc --noEmit`.
9. Run `npm run dev` briefly.
10. Update `.claude/memory/progress.md`.

## Rules

- Burmese text first, English secondary.
- Use pastel nature theme colors.
- Use `cn()` from `lib/utils.ts`.
- Use `formatDuration` from `lib/time.ts` for time display.
- Progress bar = `totalTimeSeconds / targetTimeSeconds * 100`.
- Empty state must be friendly and beginner-friendly.
- Do NOT modify the store slice in this piece.

## Verification

- TypeScript compiles.
- Dev server starts.
- `/projects` route renders project list.
- Dashboard "Add New Project" button opens form.
- Adding a project from dashboard or /projects page updates the list.

## Virtual Sizing
- **Small**: 3 new files, 1 modified file, ~120 lines.
