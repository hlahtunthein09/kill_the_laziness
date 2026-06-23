# Skill: Piece 6a — Settings Page Shell

## Goal
Create a lightweight `/settings` page shell with a Burmese-first title and placeholder sections for future settings controls.

## Files to Create
1. `app/settings/page.tsx` — server component with Burmese title and section placeholders.
2. `app/__tests__/settings-page.test.tsx` — verifies the page renders with Burmese labels.

## Implementation Details
- Page should be a simple server component (no state, no browser APIs).
- Title: `"ဆက်တင်များ"` with English subtitle `"Settings"`.
- Include placeholder section labels for upcoming pieces:
  - `"အထူးသတိပြုရန် မုဒ်"` / `"Strict Mode"`
  - `"တားမြစ်ထားသော ဝဘ်ဆိုက်များ"` / `"Forbidden URLs"`
  - `"အသိပေးချက်များ"` / `"Notifications"`
  - `"အပြင်အဆင်"` / `"Theme"`
- Use existing layout/shell; no sidebar changes needed (sidebar already has `/settings` link).

## Test Strategy
- Render the page and assert the Burmese title is present.
- Assert each placeholder section label is present.
- Do NOT mock the store for this shell piece.

## Verification Checklist
- [ ] `app/settings/page.tsx` created with Burmese-first labels
- [ ] `app/__tests__/settings-page.test.tsx` created with passing tests
- [ ] `npx vitest run app/__tests__/settings-page.test.tsx` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] No existing files modified

## Notes
- This is intentionally a shell; interactive controls will be added in 6b, 6c, 6d, 6e.
- Keep the page under 100 lines.
