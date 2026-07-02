# Skill: Extension Off-Screen Completion Notifications (Piece C)

## Goal
Make desktop notifications meaningful by showing project/sub-piece names and different messages for sub-piece vs project target completion.

## Scope
- `extension/lib/types.ts` — add optional `targetTimeSeconds` to `ExtensionTimerState`.
- `hooks/useTimer.ts` — include `targetTimeSeconds` in `persistSession`.
- `extension/lib/focusSync.ts` — accept `targetTimeSeconds` in validation.
- `extension/lib/messageHandler.ts` — accept `targetTimeSeconds` in payload validation.
- `extension/lib/timerAlarm.ts` — choose notification based on project target reached vs sub-piece zero.
- Tests: `extension/lib/__tests__/timerAlarm.test.ts`, `extension/lib/__tests__/focusSync.test.ts`, `hooks/__tests__/useTimer.test.tsx`.

## Notification copy

### Sub-piece completion
- Title (Burmese): `{subPieceName} အတွက် အချိန် ပြည့်ပါပြီ`
- Title (English): `{subPieceName} is complete`
- Body (Burmese): `နောက်တစ်ခုကို ဆက်လုပ်ကြရအောင်`
- Body (English): `Let's move on to the next one.`

### Project target completion
- Title (Burmese): `{projectName} အတွက် အချိန်ပြည့်ပါပြီ`
- Title (English): `{projectName} target reached`
- Body (Burmese): `သင့်ရဲ့အာရုံစူးစိုက်နိုင်စွမ်းအတွက် ဂုဏ်ယူပါတယ်`
- Body (English): `Proud of your focus.`

Display format in notification: Burmese line first, English line second.

## Implementation

### `extension/lib/types.ts`
```ts
export interface ExtensionTimerState {
  projectId: string;
  subPieceId?: string;
  projectName?: string;
  subPieceName?: string;
  projectElapsed: number;
  subPieceRemaining: number;
  targetTimeSeconds?: number;
  isRunning: boolean;
  savedAt: number;
  schedules?: FocusSessionSchedule[];
}
```

### `hooks/useTimer.ts`
In `persistSession`, add:
```ts
targetTimeSeconds: activeProject?.targetTimeSeconds ?? 0,
```
(Only pass if project exists.)

### `extension/lib/focusSync.ts`
In `readFocusSession` validation, add optional check:
```ts
("targetTimeSeconds" in parsed ? typeof (parsed as Record<string, unknown>).targetTimeSeconds === "number" : true)
```

### `extension/lib/messageHandler.ts`
In `UPDATE_TIMER_STATE` validation, add:
```ts
(payload.targetTimeSeconds !== undefined ? typeof payload.targetTimeSeconds === "number" : true)
```

### `extension/lib/timerAlarm.ts`
In `onAlarmTick`, when `updatedSubPieceRemaining <= 0`:
- Determine `isProjectComplete = state.targetTimeSeconds ? updatedProjectElapsed >= state.targetTimeSeconds : false`.
- Build notification based on `isProjectComplete`.
- Use `state.projectName ?? "ပရောဂျက်"` and `state.subPieceName ?? "အထွေထွေ focus"`.
- Title format: `${name} အတွက် အချိန် ပြည့်ပါပြီ\n${nameEn} ${isProjectComplete ? "target reached" : "is complete"}`
- Body format similarly.

But Chrome notifications `message` supports newlines? Yes, `\n` works in many desktop notifications. Use `\n` between Burmese and English.

Alternatively, set title to Burmese only and message to English only to keep it shorter. But user asked for both. Use Burmese title + English body.

Decide: 
- Title: Burmese
- Message: English

This is clean and fits desktop notifications.

So:
- Sub-piece: title = `{subPieceName} အတွက် အချိန် ပြည့်ပါပြီ`, message = `{subPieceName} is complete. Let's move on to the next one.`
- Project: title = `{projectName} အတွက် အချိန်ပြည့်ပါပြီ`, message = `{projectName} target reached. Proud of your focus.`

## Tests
### `timerAlarm.test.ts`
- Update existing sub-piece completion test to assert new title/message.
- Add project completion test: set `targetTimeSeconds` and `projectElapsed` so target is reached; assert project notification title/message.

### `focusSync.test.ts`
- Add/update tests that `targetTimeSeconds` is forwarded in payload.

### `useTimer.test.tsx`
- Assert persisted session includes `targetTimeSeconds`.

## Verify (piece NOT done until all pass)
- `npx tsc --noEmit`
- `npx vitest run extension/lib/__tests__/timerAlarm.test.ts extension/lib/__tests__/focusSync.test.ts hooks/__tests__/useTimer.test.tsx`
- `npm run build:ext`

## Done criteria
Extension notifications show project/sub-piece-specific messages, tests pass, WXT build succeeds.
