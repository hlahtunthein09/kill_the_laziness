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
