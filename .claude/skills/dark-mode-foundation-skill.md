# Skill — Dark Mode Foundation (Piece 1)

## Scope
Update the global CSS theme foundation so later dark-mode component fixes inherit a consistent palette.

Only modify:
- `app/globals.css`
- Add test file `app/__tests__/globals.test.ts`

## Changes
1. Replace the `.dark` CSS custom properties with the researched palette:
   - `--background: #0B1120`
   - `--card: #1E293B`
   - `--primary: #C6F135`
   - `--primary-foreground: #0B1120`
   - `--secondary: #22C55E`
   - `--secondary-foreground: #0B1120`
   - `--foreground: #F8FAFC`
   - `--muted: #334155`
   - `--muted-foreground: #94A3B8`
   - `--border: #334155`
   - `--input: #334155`
   - `--ring: #C6F135`
   - `--sidebar: #0B1120`
   - `--sidebar-foreground: #F8FAFC`
   - `--sidebar-primary: #C6F135`
   - `--sidebar-primary-foreground: #0B1120`
   - `--sidebar-accent: #1E293B`
   - `--sidebar-accent-foreground: #F8FAFC`
   - `--sidebar-border: #334155`
   - `--sidebar-ring: #C6F135`
   - `--success: #22C55E`
   - `--success-foreground: #0B1120`
   - Chart colors can reuse primary/secondary/accent/success/destructive.

2. Add dark variants for the light-only gradient utilities so `.dark .bg-gradient-soft`, `.dark .bg-gradient-nature`, `.dark .bg-gradient-mint`, `.dark .bg-gradient-ocean`, `.dark .bg-gradient-sand` render correctly on dark mode.

3. Add a dark variant for `.bg-card-glow` that uses a subtle primary-colored shadow instead of the teal shadow.

## Test Strategy
Create `app/__tests__/globals.test.ts`:
- Read `app/globals.css` as text.
- Assert the `.dark` block contains the expected hex values for `--background`, `--card`, `--primary`, `--secondary`, `--foreground`, `--muted-foreground`, and `--border`.
- Assert dark gradient utility overrides exist for `.dark .bg-gradient-soft` and `.dark .bg-gradient-nature`.
- Assert `.dark .bg-card-glow` exists.

Run only this test file during agent work.

## Verification Checklist
- [ ] `app/globals.css` updated.
- [ ] `app/__tests__/globals.test.ts` created and passing.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run app/__tests__/globals.test.ts` passes.
- [ ] No Playwright/browser work.
