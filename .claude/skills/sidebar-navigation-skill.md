# Skill: Sidebar + Burmese Navigation Build

## Purpose
Create the sidebar navigation component with Burmese-first labels and active route highlighting.

## When to Use
Building the main navigation sidebar for the FocusFlow AI dashboard.

## References Studied

### Active Navigation with usePathname (Context7 `/vercel/next.js`)
Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/04-functions/use-pathname.mdx

```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav>
      <Link className={`link ${pathname === '/' ? 'active' : ''}`} href="/">
        Home
      </Link>
    </nav>
  )
}
```

### shadcn/ui Sidebar Menu (Context7 `/shadcn-ui/ui`)
Source: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/components/components/sidebar.mdx

```tsx
<SidebarMenu>
  {items.map((item) => (
    <SidebarMenuItem key={item.name}>
      <SidebarMenuButton asChild isActive={item.isActive}>
        <a href={item.url}>
          <item.icon />
          <span>{item.name}</span>
        </a>
      </SidebarMenuItem>
    </SidebarMenuItem>
  ))}
</SidebarMenu>
```

## Piece 2b Scope (Small)

### Create
- `components/layout/Sidebar.tsx` — client component with navigation links

### Modify
- `components/layout/AppShell.tsx` — replace placeholder sidebar slot with actual `Sidebar` component

## Navigation Items

| Route | Burmese Label | English Label | Icon (Lucide) |
|-------|---------------|---------------|---------------|
| `/` | ပင်မ | Dashboard | `LayoutDashboard` |
| `/projects` | ပရောဂျက်များ | Projects | `FolderKanban` |
| `/timer` | အချိန်မှတ် | Timer | `Timer` |
| `/settings` | ဆက်တင်များ | Settings | `Settings` |

## Steps

1. Read existing `components/layout/AppShell.tsx`.
2. Create `components/layout/Sidebar.tsx` as client component.
3. Define navigation items array with Burmese + English labels, icons, routes.
4. Use `usePathname()` to determine active route.
5. Render navigation links with active state styling.
6. Update `AppShell.tsx` to render `Sidebar` in the sidebar slot.
7. Run `npx tsc --noEmit`.
8. Run `npm run dev` briefly.
9. Update `.claude/memory/progress.md`.

## Rules

- Burmese text first, English in smaller/secondary text.
- Client component (`"use client"`) because of `usePathname`.
- Use Lucide React icons.
- Active link uses distinct background/text color.
- Keep responsive behavior from AppShell (hidden on mobile, visible on desktop).
- Do not create new pages in this piece.

## Verification

- TypeScript compiles.
- Dev server starts.
- Sidebar renders with all navigation items.
- Active route is highlighted.

## Virtual Sizing
- **Small**: 1 new file, 1 modified file, ~100 lines.
