# Notification Spec

## Tiers

| Tier | Trigger | Tone |
|------|---------|------|
| beginning | elapsed < 60s | Warm, inviting, get-started energy |
| struggling | elapsed > 300s and (no remaining or remaining > 300s) | Gentle, empathetic, no shaming |
| succeeding | timer running, making progress | Celebratory, momentum-building |
| completing | remaining < 60s | Triumphant, finish-line energy |

## Tone Guidelines

- Burmese first, English in parentheses or subtitle.
- Short enough for desktop/mobile notification popups (< 60 chars per line).
- Encouraging only. Never blame the user.
- Use nature/fortress metaphors where natural (e.g., " fortress growing", "focus blooming").
- Each tier must have at least 3 messages for variety.

## Notification Types

1. **Session Complete** — sub-piece finished, timer auto-paused.
2. **Distraction Blocked** — user tried to visit a forbidden URL.
3. **Milestone** — reached a time milestone (e.g., 25 min, 1 hour).

## Language Rules

- UI labels: Burmese first, English in parentheses or subtitle.
- Code: English only.
- User input (project names, task titles): allow English or Burmese.
