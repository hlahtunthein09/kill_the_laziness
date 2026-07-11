# Popup Display Synchronization Fix Plan

## Objective

The popup is **NOT** another timer.

Its only responsibility is to mirror the current timer running inside the web application.

The popup must always stay synchronized with the Timer Engine.

---

# Current Problems

## Problem 1

The popup always displays

```
Project Used Time / Project Total Time
```

even when the user is currently running a Sub-piece timer.

This is incorrect.

The popup must display whichever timer is currently active.

---

## Problem 2

After multiple Pause / Resume operations,

the popup gradually becomes out of sync.

Example

```
Web App

Completed

↓

Popup

Still 8 seconds remaining
```

The delay varies.

Sometimes 3 seconds.

Sometimes 8 seconds.

Sometimes more.

This indicates the popup is not synchronized with the Timer Engine.

---

# Target Behavior

If the active timer is

```
Project
```

display

```
Project Used Time

/

Project Total Time
```

---

If the active timer is

```
Sub-piece
```

display

```
Sub-piece Used Time

/

Allocated Time
```

---

If the timer completes,

the popup must immediately show

```
Completed
```

without waiting for polling.

---

# Synchronization Principle

The Timer Engine is the only source of truth.

The popup must never calculate timer progress.

The popup must never determine which timer is active.

The popup must never own elapsed time.

The popup only renders the latest synchronized DisplayState.

---

# DisplayState

The Timer Engine should build a normalized DisplayState.

Example

```ts
{
    mode,

    usedSeconds,

    totalSeconds,

    isRunning,

    isCompleted
}
```

The popup must render this object exactly as received.

No additional calculations.

---

# Event Driven Synchronization

Whenever the Timer Engine changes state,

the popup must synchronize immediately.

State changes include

- Start

- Pause

- Resume

- Reset

- Complete

Every state transition should update the DisplayState.

After updating,

notify the extension that the DisplayState has changed.

The popup should immediately reload the latest DisplayState.

Polling should only exist as a fallback.

Real synchronization should happen through state transitions.

---

# Popup Responsibilities

The popup should

✓ Read DisplayState

✓ Render DisplayState

Nothing else.

The popup should NOT

✗ calculate elapsed time

✗ increment seconds

✗ determine Project/Sub-piece

✗ estimate completion

✗ create its own timer

✗ create its own countdown

---

# Pause / Resume

Pause

↓

DisplayState updates

↓

Popup updates

Resume

↓

DisplayState updates

↓

Popup updates

The popup must never continue counting while paused.

---

# Completion

When the Timer Engine reaches completion,

DisplayState must immediately become

```
isCompleted = true
```

The popup should immediately display

```
Completed
```

without waiting for the next polling cycle.

---

# Expected Result

After this implementation,

the popup should always display the same timer state as the web application.

Project → Project

Sub-piece → Sub-piece

Paused → Paused

Running → Running

Completed → Completed

The popup should behave as a passive mirror of the Timer Engine and remain synchronized regardless of Pause, Resume, Reset, or Complete.