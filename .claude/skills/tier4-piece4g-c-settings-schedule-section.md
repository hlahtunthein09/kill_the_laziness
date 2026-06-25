# Skill: Tier 4 Piece 4g-c — Settings Page Schedules Section

## Goal
Add the schedule management section to the `/settings` page so users can add, edit, and delete recurring focus sessions.

## Files

### Modify
- `app/settings/page.tsx` — add schedules card section.
- `app/__tests__/settings-page.test.tsx` — add assertions for the new section.

## Implementation Details

1. `app/settings/page.tsx`:
   - Import `ScheduleForm` from `@/components/schedule/ScheduleForm`.
   - Import `ScheduleList` from `@/components/schedule/ScheduleList`.
   - Add a new card section before or after the Distraction Log section:
     ```tsx
     {/* Scheduled Focus Sessions */}
     <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
       <div className="mb-4 flex items-start justify-between gap-4">
         <div>
           <h2 className="text-lg font-semibold text-stone-900">
             စီစဉ်ထားသော focus အချိန်များ (Scheduled Focus)
           </h2>
           <p className="text-sm text-stone-500 mt-1">
             ပုံမှန်စီစဉ်ထားသော focus အချိန်များကို စီမံခန့်ခွဲပါ
           </p>
         </div>
         <ScheduleForm />
       </div>
       <ScheduleList />
     </div>
     ```

2. Keep the existing card styling consistent with other settings sections.

## Test Strategy

Extend `app/__tests__/settings-page.test.tsx`:

```tsx
it('renders scheduled focus section', () => {
  render(<SettingsPage />);
  expect(screen.getByText('စီစဉ်ထားသော focus အချိန်များ (Scheduled Focus)')).toBeInTheDocument();
});

it('renders schedule form trigger', () => {
  render(<SettingsPage />);
  expect(screen.getByText(/Add Schedule/)).toBeInTheDocument();
});

it('renders schedule list empty state', () => {
  render(<SettingsPage />);
  expect(screen.getByText('စီစဉ်ထားသော focus အချိန် မရှိသေးပါ')).toBeInTheDocument();
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run app/__tests__/settings-page.test.tsx` passes.
- [ ] `npm run build` succeeds (settings page is part of the app).
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read `app/settings/page.tsx` and its test file.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- If any step fails, fix it before reporting done.
