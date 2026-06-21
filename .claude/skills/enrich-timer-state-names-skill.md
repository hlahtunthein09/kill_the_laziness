# Skill: Enrich Timer State with Names (Piece 13a)

## Purpose
Add optional project and sub-piece names to the timer state that is synced from the web app to the extension, so the extension popup can display user-friendly labels.

## Background
- Piece 12 syncs `ff_active_session` from the web app localStorage to extension storage via a content script.
- The synced state (`ExtensionTimerState`) currently only contains IDs (`projectId`, `subPieceId`) and timing fields.
- The upcoming Piece 13b popup needs human-readable names, so the state shape needs to carry them.

## Scope
- **Create**: none
- **Modify**
  - `extension/lib/types.ts` — add optional `projectName` and `subPieceName` to `ExtensionTimerState`
  - `hooks/useTimer.ts` — include names in `SessionData` and `persistSession`
  - `extension/lib/focusSync.ts` — accept optional name fields in `readFocusSession`
- **Size**: Small — 3 files, ~40 lines

## References
- `.claude/memory/sync-protocol.md`
- `extension/lib/types.ts`
- `hooks/useTimer.ts`
- `extension/lib/focusSync.ts`

## Steps
1. Read `.claude/CLAUDE.md`, `.claude/memory/sync-protocol.md`, `.claude/memory/progress.md`.
2. Read `extension/lib/types.ts`, `hooks/useTimer.ts`, `extension/lib/focusSync.ts`, and `extension/lib/__tests__/focusSync.test.ts`.
3. Update `extension/lib/types.ts`.
   - Extend `ExtensionTimerState` with:
     ```ts
     projectName?: string;
     subPieceName?: string;
     ```
4. Update `hooks/useTimer.ts`.
   - Extend `SessionData` with optional `projectName` and `subPieceName`.
   - In `persistSession`, read `project?.name` and `subPiece?.name` and include them in the persisted session.
5. Update `extension/lib/focusSync.ts`.
   - `readFocusSession` already validates required fields; optional name fields should pass through without blocking.
   - Ensure the returned type includes the optional names.
6. Add/update tests.
   - `extension/lib/__tests__/focusSync.test.ts`: add a test that a session with names is sent as `UPDATE_TIMER_STATE` with the names preserved.
   - `hooks/__tests__/useTimer.test.tsx`: add a test that `persistSession` includes project/sub-piece names (or read from localStorage after pause).
7. Run `npx tsc --noEmit`.
8. Run `npx vitest run extension/lib/__tests__/focusSync.test.ts hooks/__tests__/useTimer.test.tsx`.
9. Run `npm run build:ext` to confirm WXT still builds.
10. Update `.claude/memory/progress.md` with a one-line status.

## Rules
- Names are optional; do not break existing tests that omit them.
- Keep changes minimal; do not add controls or UI in this piece.
- Storage key stays `ff_active_session`.
- All time values remain in seconds.

## Agent
- **Extension Engineer**

## Verification
- TypeScript compiles.
- Existing tests still pass.
- New name-pass-through tests pass.
- WXT build succeeds.
