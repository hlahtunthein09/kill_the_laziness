# Skill: Background Tab Monitoring + Strict Mode Redirect Build

## Purpose
Monitor browser tabs and redirect forbidden distraction URLs to a blocked page when strict mode is enabled.

## Scope
- **Create**
  - `extension/lib/urlChecker.ts`
  - `extension/lib/__tests__/urlChecker.test.ts`
  - `extension/entrypoints/blocked.html`
  - `extension/lib/__tests__/background-redirect.test.ts`
- **Modify**
  - `extension/entrypoints/background.ts`
  - `wxt.config.ts`
- **Size**: Small — 5 files, ~150 lines

## References
- `.claude/memory/extension-architecture.md`
- `lib/constants.ts` — default forbidden URL fragments
- Context7 `/wxt-dev/wxt` — background entrypoints
- Context7 `/websites/developer_mozilla_en-us_mozilla_add-ons_webextensions` — `tabs.onUpdated`, `tabs.update`, `web_accessible_resources`

## Steps
1. Read `.claude/CLAUDE.md`, `.claude/memory/extension-architecture.md`, `.claude/memory/progress.md`.
2. Read `lib/constants.ts` (or `lib/store/slices/settingsSlice.ts`) for default forbidden URLs.
3. Create `extension/lib/urlChecker.ts`.
   - `isForbiddenUrl(url: string, forbiddenPatterns: string[]): boolean`
   - Match against URL fragments (e.g., `youtube.com/shorts`, `instagram.com/reels`).
   - Export default forbidden list from `lib/constants.ts` or duplicate a small list.
4. Create `extension/lib/__tests__/urlChecker.test.ts`.
   - Test allowed URLs return false.
   - Test forbidden URLs return true.
5. Create `extension/entrypoints/blocked.html`.
   - Minimal HTML page with pastel nature theme.
   - Burmese-first message: "ဒီစာမျက်နှာကို ပိတ်ထားပါတယ်။ သင့်ပရောဂျက်ဆီပြန် focus လုပ်လိုက်ပါ။" / "This page is blocked. Return to your focus."
6. Update `extension/entrypoints/background.ts`.
   - Inside `defineBackground`, add `browser.tabs.onUpdated.addListener`.
   - For each tab update with `status === "loading"` or `url` change:
     - Read `strictMode` from extension storage (for now default to `true` or read from `ff_focus_store` if synced).
     - If strict mode and URL is forbidden, call `browser.tabs.update(tabId, { url: browser.runtime.getURL("blocked.html") })`.
   - Log the attempt to extension storage for future distraction logs.
7. Update `wxt.config.ts`.
   - Add `web_accessible_resources: [{ resources: ["blocked.html"], matches: ["<all_urls>"] }]`.
8. Create `extension/lib/__tests__/background-redirect.test.ts`.
   - Mock `browser.tabs` via `@webext-core/fake-browser`.
   - Test that the redirect function updates the tab to `blocked.html` for forbidden URLs.
   - Test that allowed URLs are ignored.
9. Run `npx tsc --noEmit` and `npx vitest run extension/lib/__tests__/urlChecker.test.ts extension/lib/__tests__/background-redirect.test.ts`.
10. Run `npm run build:ext` to verify WXT still builds.
11. Update `.claude/memory/progress.md`.

## Rules
- Use `browser.*` APIs.
- Keep strict mode check simple for now (default true; sync with web app settings later).
- Storage key prefix `ff_`.
- Do not implement warn mode overlay in this piece.
- Do not modify web app code.

## Agent
- **Extension Engineer**

## Verification
- TypeScript compiles.
- URL checker and redirect tests pass.
- `npm run build:ext` succeeds.
- Output manifest contains `web_accessible_resources` for `blocked.html`.
