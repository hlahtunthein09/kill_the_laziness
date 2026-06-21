# Skill: Extension Storage + Timer State Listener Build

## Purpose
Set up the extension's storage wrapper and background message listener so the web app can send timer state to the extension.

## Scope
- **Create**
  - `extension/lib/storage.ts`
  - `extension/lib/__tests__/storage.test.ts`
  - `extension/lib/__tests__/background.test.ts`
- **Modify**
  - `extension/entrypoints/background.ts`
  - `wxt.config.ts` — add `externally_connectable`
- **Size**: Small — 5 files, ~150 lines

## References
- `.claude/memory/extension-architecture.md`
- `wxt.config.ts`
- Context7 `/wxt-dev/wxt` — background entrypoints, storage
- Context7 `/websites/developer_mozilla_en-us_mozilla_add-ons_webextensions` — `runtime.onMessage`, `storage.local`

## Steps
1. Read `.claude/CLAUDE.md`, `.claude/memory/extension-architecture.md`, `.claude/memory/progress.md`.
2. Read `wxt.config.ts` and `extension/entrypoints/background.ts`.
3. Create `extension/lib/storage.ts`.
   - Wrap `browser.storage.local` with typed helpers:
     ```ts
     export async function setTimerState(state: ExtensionTimerState): Promise<void>;
     export async function getTimerState(): Promise<ExtensionTimerState | null>;
     export async function clearTimerState(): Promise<void>;
     ```
   - Storage key: `ff_extension_timer`.
   - Type `ExtensionTimerState`:
     ```ts
     interface ExtensionTimerState {
       projectId: string;
       subPieceId?: string;
       projectElapsed: number;
       subPieceRemaining: number;
       isRunning: boolean;
       savedAt: number;
     }
     ```
4. Create `extension/lib/types.ts` for shared extension types.
5. Update `extension/entrypoints/background.ts`.
   - Inside `defineBackground`, add `browser.runtime.onMessage.addListener`.
   - Handle action `UPDATE_TIMER_STATE`:
     - Validate payload.
     - Call `setTimerState(payload)`.
     - Return `{ ok: true }`.
   - Handle action `GET_TIMER_STATE`:
     - Return current state.
   - Log unknown actions.
6. Update `wxt.config.ts`.
   - Add `externally_connectable: { ids: [], matches: ["http://localhost:3000/*"] }`.
7. Create tests.
   - `extension/lib/__tests__/storage.test.ts`:
     - Mock `browser.storage.local` via `@webext-core/fake-browser`.
     - Test set/get/clear roundtrip.
   - `extension/lib/__tests__/background.test.ts`:
     - Import the background listener function (refactor background.ts to export `handleMessage` if needed).
     - Test UPDATE_TIMER_STATE stores state.
     - Test GET_TIMER_STATE returns stored state.
     - Test unknown action returns error.
8. Run `npx tsc --noEmit` and `npx vitest run extension/lib/__tests__/storage.test.ts extension/lib/__tests__/background.test.ts`.
9. Run `npm run build:ext` to verify WXT still builds.
10. Update `.claude/memory/progress.md`.

## Rules
- Use `browser.*` APIs (WXT provides cross-browser polyfill).
- Storage key must use `ff_` prefix.
- Keep background listener idempotent.
- Do not implement alarms or notifications in this piece.
- Every test must mock browser APIs; do not require a real browser.

## Agent
- **Extension Engineer**

## Verification
- TypeScript compiles.
- Storage and background tests pass.
- `npm run build:ext` succeeds.
- Web app origin is declared in `externally_connectable`.
