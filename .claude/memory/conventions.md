# Project Conventions

## Language
- UI labels: Burmese first, English in parentheses or subtitle.
- Code: English only.
- User input (project names, task titles): allow English or Burmese.

## Colors
- Background: `#f0fdfa` (teal-50)
- Primary: `#14b8a6` (teal-500 / mint)
- Secondary: `#0ea5e9` (sky-500 / ocean)
- Accent: `#fde68a` (amber-200 / sand)
- Success: `#34d399` (emerald-400 / forest)
- Text primary: `#1c1917` (stone-900)
- Text secondary: `#78716c` (stone-500)

## Storage
- All keys prefixed with `ff_`.
- Time stored in seconds.

## State Management
- One unified store: `useFocusStore` via Zustand slices pattern.
- Each domain slice lives in `lib/store/slices/<domain>Slice.ts` with its own `<Domain>Slice` interface.
- Combined type: `FocusState = ProjectSlice & SettingsSlice & DistractionSlice & ...`.
- Cross-slice actions use `get()` to access other slices.
- Persist middleware wraps the combined store only; storage key is `ff_focus_store`.
- Do NOT create separate `create()` calls per slice.

## Components
- Use `cn()` from `lib/utils.ts`.
- Client components marked `"use client"` when using hooks/state.
- Keep components single-responsibility.

## TypeScript
- Strict mode.
- No `any`.
- Domain types in `lib/types/index.ts`.

## File Naming
- Components: PascalCase (`ProjectCard.tsx`)
- Hooks: camelCase with `use` prefix (`useTimer.ts`)
- Utilities: camelCase (`time.ts`)
- Pages: Next.js App Router conventions
