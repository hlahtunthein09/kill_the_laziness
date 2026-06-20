# Skill: Notification Craft

## Purpose
Create motivational notification copy and message delivery helpers.

## When to Use
Adding or updating motivational messages, toast notifications, or extension alerts.

## References
- Forest app notification patterns
- Pomofocus minimal message style

## Steps
1. Read `.claude/memory/notification-spec.md` (create if missing).
2. Update `lib/notifications.ts` or `lib/motivation.ts`.
3. Create tiered message arrays by performance state.
4. Test message lengths for desktop/mobile notifications.
5. Update `.claude/memory/progress.md`.

## Rules
- Burmese first, English secondary.
- Encouraging tone. No shaming.
- Short enough for notification popup.
- Parse active task name into message string.

## Verification
- Messages render correctly in Burmese.
- No broken strings.
- Variety exists across tiers.
