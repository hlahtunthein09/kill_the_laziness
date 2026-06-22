# Skill: Fix Extension `require()` Lint Errors

## Goal

Resolve ESLint `@typescript-eslint/no-require-imports` errors in the extension library files by replacing `require()` style imports with ES module imports.

## Files to Fix

- `extension/lib/focusSync.ts`
- `extension/lib/redirect.ts`
- `extension/lib/storage.ts`
- `extension/lib/timerAlarm.ts`

## Root Cause

These files use `require()` to import `webextension-polyfill` (or similar modules), which triggers ESLint's `no-require-imports` rule. The project uses ES modules and TypeScript, so `require()` should be avoided.

## Implementation Plan

1. Read each file and identify the `require()` usage.
2. Replace with the appropriate ES module import:
   - If the module is always needed: use top-level `import browser from "webextension-polyfill"`.
   - If lazy loading is genuinely needed for testability or startup performance: use dynamic `import()` (e.g., `const browser = await import("webextension-polyfill")`).
3. Preserve the existing swappable-browser test pattern if present:
   - Some files may accept a `browser` parameter or use a module-level variable to allow `fakeBrowser` injection in tests.
   - Do not break this pattern; convert the `require()` that initializes the default browser instance only.
4. Run tests for each modified file and fix any failures.

## Test Plan

- Run `npx tsc --noEmit`
- Run `npx eslint extension/lib/focusSync.ts extension/lib/redirect.ts extension/lib/storage.ts extension/lib/timerAlarm.ts` — must show 0 errors for these files.
- Run `npx vitest run extension/` — all extension tests must pass.
- Run `npm run build:ext` — extension must still build successfully.
- Run `npm test` — full suite must pass.

## Constraints

- Do not change extension behavior.
- Keep `fakeBrowser` test injection working.
- Do not refactor unrelated extension logic.
- Do not accept completion until lint errors for the four files are gone and all extension tests pass.

## Agent Instructions

- Read the four target files and their tests first.
- Identify the exact `require()` calls and replace them appropriately.
- Run lint, tests, and extension build commands.
- Report files changed, lint results, test results, and build status.
