# Skill: App Shell + Layout Wrapper Build

## Purpose
Create the root app shell wrapper for FocusFlow AI dashboard.

## When to Use
Building the foundational layout structure before adding navigation or pages.

## References Studied

### Next.js App Router Layout (Context7 `/vercel/next.js`)
Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/01-getting-started/03-layouts-and-pages.mdx

Root layout is a Server Component that wraps all pages:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### Client Providers in Layout (Context7 `/vercel/next.js`)
Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/01-getting-started/05-server-and-client-components.mdx

Wrap client components in a server layout:

```tsx
import ThemeProvider from './theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

## Piece 2a Scope (Small)

### Create
- `components/layout/AppShell.tsx` — client component that accepts `children` and renders a flex row layout (sidebar slot + main content area)

### Modify
- `app/layout.tsx` — import AppShell, wrap children
- `app/page.tsx` — simple placeholder dashboard content

## Steps

1. Read existing `app/layout.tsx` and `app/page.tsx`.
2. Create `components/layout/AppShell.tsx` as a client component with props `{ children: React.ReactNode }`.
3. Use Tailwind flex layout: sidebar area (fixed width) + main area (flex-1).
4. Update `app/layout.tsx` to wrap `children` with `AppShell`.
5. Update `app/page.tsx` to show a simple placeholder (e.g., app name + brief welcome in Burmese).
6. Run `npx tsc --noEmit`.
7. Run `npm run dev` briefly.
8. Update `.claude/memory/progress.md`.

## Rules

- AppShell is a client component (`"use client"`) because it will later contain interactive sidebar/header.
- Keep layout responsive (flex-col on mobile, flex-row on desktop).
- Use pastel nature background color from theme.
- No actual Sidebar or Header in this piece — only placeholder slots.
- Burmese text in `app/page.tsx` placeholder.

## Verification

- TypeScript compiles.
- Dev server starts.
- Page renders with app shell structure visible.

## Virtual Sizing
- **Small**: 1 new file, 2 modified files, ~80 lines total.
