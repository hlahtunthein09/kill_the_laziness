# Master Skill: Frontend Foundation & Layout

## Purpose
Build and maintain the shell, navigation, theming, dashboard, and global page wiring of the FocusFlow AI Next.js app.

## Scope
- App shell, layout, header, sidebar navigation
- Theme provider + dark-mode tokens
- Dashboard home page (`/`)
- Global providers (hydration, tooltip, toaster)
- Reusable page/container patterns

## Key Files
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `components/layout/AppShell.tsx`
- `components/layout/Header.tsx`
- `components/layout/Sidebar.tsx`
- `components/providers/ThemeProvider.tsx`
- `components/providers/StoreHydrationProvider.tsx`
- `components/ui/sonner.tsx`

## Architecture Conventions

### Layout
- `app/layout.tsx` is the server root. It wraps children in `ThemeProvider`, `TooltipProvider`, `AppShell`, and `StoreHydrationProvider`, plus `<Toaster />`.
- `AppShell` provides the flex row: `Sidebar` on the left, main content area on the right.
- `Sidebar` holds navigation links using Burmese-first labels + English subtitle.
- `Header` is minimal; dashboard greeting lives on `app/page.tsx`, not in the header.

### Theming
- Light/dark mode is driven by `next-themes` via `ThemeProvider`.
- Color tokens live in `app/globals.css` under `:root` and `.dark`.
- Use Tailwind semantic classes (`bg-background`, `text-foreground`, `border-border`, etc.).
- Nature palette: mint `#14b8a6`, ocean `#0ea5e9`, sand `#fde68a`, forest `#34d399`.

### Dashboard (`app/page.tsx`)
- Server component that reads from `useFocusStore` (wrapped by client components).
- Shows: greeting, fortress level/stats, quick actions, daily goal, streak.
- Stats are computed from the store; never hardcode numbers.

## Implementation Checklist

1. Read `.claude/memory/ui-conventions.md` and `.claude/memory/store-schema.md`.
2. Keep components as server components unless they need state/hydration/browser APIs.
3. Use `cn()` from `lib/utils.ts` for conditional classes.
4. All user-facing text: Burmese first, English in parentheses or subtitle.
5. Add `data-testid` attributes for RTL tests on dynamic values.

## Testing Strategy
- Component tests with React Testing Library.
- Test navigation links route correctly.
- Test dashboard stats render from store state.
- Test dark-mode class application (mock `next-themes` if needed).
- Run `npx tsc --noEmit` and `npx vitest run` for affected files.

## Agent Notes
- When adding a new page, follow the existing `app/<route>/page.tsx` pattern.
- When adding a new layout component, place it under `components/layout/`.
- When adding a new provider, place it under `components/providers/` and wire it in `app/layout.tsx`.
- Do not introduce new theme tokens unless approved by the user; reuse the nature palette.
- Always keep the sidebar navigation in sync with new top-level routes.
