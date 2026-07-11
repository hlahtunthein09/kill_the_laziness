# Task: Root Cause Investigation (Do NOT Fix Yet)

We are debugging a synchronization issue between the Timer Engine (web app) and the Chrome Extension popup.

**DO NOT modify any code yet.**

Your task is ONLY to investigate the current implementation and identify the exact root cause(s).

---

## Current Expected Behavior

The popup is NOT another timer.

The popup is only a remote display of the Timer Engine.

The Timer Engine is the single source of truth.

The popup should only display the current timer state.

---

## Expected Display Behavior

If the user starts a Project timer:

Popup displays

Project Used Time / Project Total Time

Example

```
12 / 50 minutes
```

---

If the user starts a Sub-piece timer:

Popup displays

Sub-piece Used Time / Sub-piece Total Time

Example

```
46 / 120 seconds
```

---

If the timer completes

Popup immediately changes to

```
Completed
```

without delay.

---

If the user pauses

Popup immediately reflects the paused state.

---

If the user resumes

Popup immediately continues displaying the correct elapsed time.

---

If the user resets

Popup immediately resets.

---

## Current Problems

Problem 1

The popup always displays the Project timer.

Even when the active timer is a Sub-piece timer.

---

Problem 2

After multiple Pause / Resume operations

the popup becomes desynchronized.

Example

Real Timer

```
Finished
```

Popup

```
Still 8 seconds remaining
```

The number varies.

Sometimes

3 seconds

Sometimes

8 seconds

Sometimes

11 seconds

---

This indicates the popup is drifting away from the Timer Engine.

---

# Investigation Requirements

Trace the COMPLETE data flow.

Start from

```
Timer Engine
```

Until

```
Popup UI
```

I want the exact path.

For example

```
Timer Engine

↓

Session

↓

Storage

↓

Content Script

↓

Service Worker

↓

Popup

↓

React State

↓

UI
```

Do not skip any step.

---

# Investigation 1

Find exactly where

```
usedSeconds
```

comes from.

Trace every assignment.

Trace every calculation.

Trace every update.

---

# Investigation 2

Find exactly where

```
totalSeconds
```

comes from.

---

# Investigation 3

Determine how the popup decides

```
Project

or

Sub-piece
```

Is this decision made by

- Timer Engine

or

- Popup

or

- Content Script

or

- Service Worker

Show the exact code path.

---

# Investigation 4

Search the ENTIRE project for every place where elapsed time is calculated.

Look for

```
setInterval

setTimeout

Date.now()

performance.now()

elapsed++

usedSeconds++

seconds++

minutes++

new Date()

requestAnimationFrame
```

List every occurrence.

Explain why it exists.

---

# Investigation 5

Determine whether the popup owns its own timer.

Answer these questions.

Does the popup

- calculate elapsed time?

- increment elapsed time?

- estimate elapsed time?

- create its own interval?

- use Date.now()?

- use startedAt?

- derive elapsed time?

Answer YES or NO.

Provide evidence.

---

# Investigation 6

Determine whether the Service Worker owns time.

Answer YES or NO.

Provide evidence.

---

# Investigation 7

Determine whether the Content Script owns time.

Answer YES or NO.

Provide evidence.

---

# Investigation 8

Determine who is the TRUE owner of

```
elapsedActiveTime
```

Show where it is created.

Show where it is updated.

Show where it is consumed.

---

# Investigation 9

Trace Pause.

```
User presses Pause
```

Follow the execution.

Which functions run?

Which objects change?

Which storage values change?

Which messages are sent?

Which UI updates happen?

---

# Investigation 10

Trace Resume.

Same detail.

---

# Investigation 11

Trace Complete.

Same detail.

---

# Investigation 12

Determine why the popup falls behind.

Do NOT guess.

Prove it using code.

I want the exact sequence that causes

```
Real Timer

Finished

↓

Popup

Still 8 seconds remaining
```

---

# Deliverables

After investigation, provide

## 1.

Complete architecture diagram.

---

## 2.

Complete data flow.

---

## 3.

List of every component that owns timer state.

---

## 4.

List of every component that calculates elapsed time.

---

## 5.

List of every synchronization point.

---

## 6.

Root cause(s).

Rank them from

Most likely

↓

Least likely

---

## 7.

Explain whether the architecture violates

"Timer Engine is the single source of truth."

If yes,

show exactly where.

---

IMPORTANT

Do NOT fix anything.

Do NOT refactor anything.

Do NOT write code.

Do NOT propose architecture yet.

Only investigate the existing implementation.

I want evidence, code references, and reasoning.

Once the investigation is complete, I will review your findings before deciding on the implementation strategy.