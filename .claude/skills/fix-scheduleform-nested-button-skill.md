# Skill: Fix Nested Button in ScheduleForm DialogTrigger (Issue #8)

## Scope
Fix the nested `<button>` hydration error in `ScheduleForm` by adding `asChild` to `DialogTrigger`.

## Root Cause
`DialogTrigger` renders its own `<button>` by default. Wrapping a shadcn `<Button>` inside it produces invalid nested buttons (`<button><button>...</button></button>`), causing React hydration warnings.

## Files
- `components/schedule/ScheduleForm.tsx` (lines 187-192)

## Change
Wrap the existing shadcn `Button` with `DialogTrigger asChild`:

```tsx
<DialogTrigger asChild>
  <Button className="bg-teal-500 hover:bg-teal-600 text-white">
    <Plus className="mr-2 h-4 w-4" />
    {triggerButtonText}
  </Button>
</DialogTrigger>
```

## Test Strategy
- Run `npx vitest run components/schedule/__tests__/ScheduleForm.test.tsx`
- Expect 5/5 tests passing.
- Run `npx tsc --noEmit`.

## Verification
- No UI behavior change; only DOM structure corrected.
- No browser verification required.
