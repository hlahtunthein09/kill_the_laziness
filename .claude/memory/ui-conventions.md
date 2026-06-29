# UI Conventions

Current UI patterns for FocusFlow AI components. Follow these to avoid re-reading source files.

## Client Components
- Any component that uses React hooks, browser APIs, or Zustand must start with `"use client"`.

## Form Pattern
- Use `useState` for controlled inputs.
- Use manual inline validation with a local `errors` object.
- Do **not** add `react-hook-form` or `zod` for simple forms.
- Use shadcn/ui primitives: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `Input`, `Textarea`, `Select`, `Button`.
- Reset form state on successful submit or close.

## Labels
- Burmese first, English in parentheses.
- Example: `"ပရောဂျက်အမည် (Project Name)"`

## Validation Messages
- Display errors in Burmese.
- Place error text below the input with `text-xs text-destructive`.

## Cards & Lists
- Use shadcn `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- Use `Progress` with subcomponents (`ProgressTrack`, `ProgressIndicator`) from `components/ui/progress.tsx`.
- Use `Badge` for status chips.
- Empty states: centered icon + Burmese message + English subtitle.

## Icons
- Use Lucide React icons.

## Class Merging
- Always use `cn()` from `lib/utils.ts` for conditional Tailwind classes.

## Theme Colors
- Background: `bg-teal-50` (#f0fdfa)
- Primary: `bg-teal-500` (#14b8a6)
- Secondary: `bg-sky-500` (#0ea5e9)
- Accent: `bg-amber-200` (#fde68a)
- Success: `bg-emerald-400` (#34d399)
- Text primary: `text-stone-900`
- Text secondary: `text-stone-500`

## Time Display
- Use `formatDuration` from `lib/time.ts` for all duration formatting.
- Store durations in seconds internally; format only at display time.

## Dark Theme (Pending User Final Approval)
Chosen palette based on user-provided slide — simple, distinctive, high contrast, no gradients.

| Role | Hex | Tailwind token |
|---|---|---|
| Background | `#0B1120` | `bg-background` |
| Card / panel | `#1E293B` | `bg-card` |
| Title text | `#FFFFFF` | `text-foreground` |
| Body / subtitle text | `#B0B8C4` | `text-muted-foreground` |
| Primary accent | `#C6F135` | `bg-primary` / `text-primary` |
| Primary accent text | `#0B1120` | `text-primary-foreground` |
| Border | `#2A3649` | `border-border` |
| Muted surface | `#2A3649` | `bg-muted` |
| Success | `#22C55E` | `bg-emerald-500` |
| Warning / paused | `#F59E0B` | `bg-amber-500` |
| Danger / blocked | `#EF4444` | `bg-rose-500` |

Rules:
- Solid colors only — no gradients in dark mode.
- White text on dark backgrounds for readability.
- Cards and panels must never be white in dark mode.
- Use lime accent sparingly for primary actions and active states.
