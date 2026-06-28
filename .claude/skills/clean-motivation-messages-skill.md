# Skill: Remove English Parentheticals from Burmese Motivation Messages

## Goal
Clean up motivation messages so the Burmese title line contains only Burmese text, and the English translation appears only in the description.

## Scope
- Modify only `lib/motivation.ts`.
- Modify only `lib/__tests__/motivation.test.ts` if any assertions check exact strings.

## Required Changes
1. In `lib/motivation.ts`:
   - For every message in `beginningMessages`, `strugglingMessages`, `succeedingMessages`, and `completingMessages`, remove the English parenthetical from the `my` field.
   - Keep the `en` field unchanged.
   - Example: `{ my: 'စတင်ကြည့်ရအောင်! (Let\'s get started!)', en: 'Let\'s get started!' }` becomes `{ my: 'စတင်ကြည့်ရအောင်!', en: 'Let\'s get started!' }`.
2. In `lib/__tests__/motivation.test.ts`:
   - Update any tests that assert exact `my` strings if necessary.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run lib/__tests__/motivation.test.ts` passes.
- [ ] No files outside the scope are modified.
