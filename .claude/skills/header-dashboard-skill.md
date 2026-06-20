# Skill: Header + Dashboard Placeholder Build

## Purpose
Create the top header component and a dashboard placeholder page for FocusFlow AI.

## When to Use
After sidebar navigation is ready and the app needs a header + main dashboard content area.

## References Studied

### shadcn/ui Card for Stats (Context7 `/shadcn-ui/ui`)
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

### Next.js Server Page with Client Components (Context7 `/vercel/next.js`)
Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/migrating/app-router-migration.mdx

Dashboard page can be a Server Component that imports Client Components for interactive parts.

## Piece 2c Scope (Small)

### Create
- `components/layout/Header.tsx` — client component top bar

### Modify
- `components/layout/AppShell.tsx` — add Header above main content
- `app/page.tsx` — replace simple welcome with dashboard placeholder widgets

## Header Content
- App logo/title (small)
- Current page title or "ပင်မ" (Dashboard)
- Placeholder user greeting in Burmese
- Optional: streak flame icon + count placeholder

## Dashboard Placeholder Content
- Welcome heading in Burmese + English
- 3 stat cards:
  - စုစုပေါင်း ပရောဂျက်များ (Total Projects)
  - ယနေ့ focus အချိန် (Today's Focus Time)
  - လက်ရှိ အဆင့် (Current Level)
- Quick action button placeholder: "ပရောဂျက်အသစ်ထည့်မယ်" (Add New Project)

## Steps

1. Read existing `components/layout/AppShell.tsx` and `app/page.tsx`.
2. Create `components/layout/Header.tsx` as client component.
3. Update `AppShell.tsx` to render Header above main content area.
4. Update `app/page.tsx` with dashboard placeholder using shadcn Card components.
5. Run `npx tsc --noEmit`.
6. Run `npm run dev` briefly.
7. Update `.claude/memory/progress.md`.

## Rules

- Header is a client component (`"use client"`).
- Page can remain a Server Component.
- Burmese text first, English secondary.
- Use shadcn Card, Button, Badge components.
- Use Lucide React icons.
- Use pastel nature theme colors.
- Placeholder data only — no real store connections in this piece.

## Verification

- TypeScript compiles.
- Dev server starts.
- Header renders at top.
- Dashboard placeholder cards render.

## Virtual Sizing
- **Small**: 1 new file, 2 modified files, ~120 lines.
