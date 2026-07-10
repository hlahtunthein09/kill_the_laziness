# Notification Synchronization Engine v2
## Engineering Specification
### Purpose

This specification defines how the Notification Engine must synchronize with the Timer Engine.

The notification algorithm (Start → Dynamic Milestones → Almost → Complete) is already implemented and working.

This document only redesigns the synchronization architecture to eliminate:

- Pause/Resume desynchronization
- Background timer drift
- Early notifications
- Late notifications
- Prefired notifications
- Duplicate notifications
- Lost notifications
- Reset race conditions
- Old session notifications
- Browser alarm inconsistencies

---

# Design Philosophy

## Single Source of Truth

The Timer Engine owns **time**.

The Notification Engine owns **notifications**.

The Notification Engine MUST NEVER calculate or maintain its own elapsed timer.

Only the Timer Engine knows:

- elapsedActiveTime
- duration
- currentState
- progress
- sessionId

The Notification Engine is simply a scheduler.

Never allow two different systems to own time.

Incorrect

```
React Timer
     │
     ├── elapsed
     │
Notification Engine
     ├── elapsed
```

Correct

```
Timer Engine
     │
     ├── elapsedActiveTime
     ├── duration
     ├── state
     └── sessionId
            │
            ▼
Notification Engine
            │
            ▼
Browser Alarm
            │
            ▼
Desktop Notification
```

---

# State Machine

The notification engine MUST react only to timer state changes.

```
             Start
Idle -----------------> Running
                         │
                         │ Pause
                         ▼
                      Paused
                         │
                         │ Resume
                         ▼
                      Running
                         │
                         │ Time Completed
                         ▼
                     Completed
                         │
                         │ Reset
                         ▼
                        Idle
```

Notification Engine MUST NOT create its own state machine.

It listens to the Timer Engine only.

---

# Session Architecture

Every timer execution is a completely new session.

Example

```
Session A

Start

↓

Pause

↓

Resume

↓

Reset

↓

Session B
```

Session A and Session B MUST NEVER share alarms.

Each session generates

```
sessionId
```

Example

```
34fd-9aa8-a231
```

Every scheduled browser alarm MUST contain

```
sessionId

notificationType

targetElapsedTime
```

Before any notification fires

Validation

```
alarm.sessionId

==

currentSession.sessionId
```

If false

```
Discard alarm immediately.
```

Never fire notifications from old sessions.

---

# Notification Lifecycle

```
User presses Start
        │
        ▼
Start Notification
        │
        ▼
Dynamic Milestones
        │
        ▼
Almost Notification
        │
        ▼
Complete Notification
        │
        ▼
Destroy Session
```

---

# START Synchronization

When user presses Start

Notification Engine MUST

1.

Generate new Session ID.

2.

Reset all notification trackers.

3.

Calculate milestone positions.

4.

Schedule browser alarms.

5.

Fire Start notification immediately.

Pseudo

```
newSession()

resetTrackers()

calculateMilestones()

scheduleNotifications()

notify(Start)
```

---

# PAUSE Synchronization

Pause is the most important synchronization event.

When Pause occurs

Notification Engine MUST

1.

Read

```
elapsedActiveTime
```

from Timer Engine.

2.

Store it.

3.

Cancel ALL browser alarms.

4.

Keep current session alive.

5.

Keep notification trackers.

6.

Do NOT reset milestone progress.

7.

Become completely idle.

Pseudo

```
elapsed = timer.elapsedActiveTime

cancelAllBrowserAlarms()

persistSession()

persistTrackers()
```

Result

```
Running

↓

Paused

↓

Active Browser Alarms

=

ZERO
```

There must never be active alarms while paused.

---

# Why This Is Necessary

Incorrect implementation

```
Start

↓

Schedule 30 sec milestone

↓

Pause at 20 sec

↓

Wait 5 minutes

↓

Resume
```

Browser alarm

already reached

30 sec

while user was paused.

Therefore

Browser immediately fires milestone.

Actual timer

20 sec

Notification

30 sec

Synchronization is broken.

---

Correct implementation

Pause

↓

Cancel alarms

↓

Resume

↓

Recalculate remaining time

↓

Create brand new alarms

No old alarms survive.

---

# RESUME Synchronization

Resume NEVER resumes old browser alarms.

Old alarms are dead.

Resume creates brand new alarms.

Algorithm

Read

```
elapsedActiveTime
```

For every remaining notification

```
remaining

=

targetElapsedTime

-

elapsedActiveTime
```

Decision

```
remaining <= 0

↓

Already passed

↓

Skip
```

Otherwise

```
browserAlarmTime

=

Date.now()

+

remaining
```

Schedule NEW browser alarm.

Never reuse old alarms.

---

Example

Timer

```
60 sec
```

Milestone

```
30 sec
```

Pause

```
20 sec
```

Resume

```
elapsed

=

20
```

Remaining

```
30

-

20

=

10 sec
```

New alarm

```
Date.now()

+

10 sec
```

User may pause

1000 times.

The result is always correct.

---

# RESET Synchronization

Reset destroys everything.

Immediately

```
cancelAllBrowserAlarms()

destroySession()

clearTrackers()

clearNotificationQueue()

resetScheduler()
```

No previous notification may survive.

Never reuse anything after Reset.

Reset always creates a clean system.

---

# COMPLETE Synchronization

Notification Engine never guesses completion.

Completion belongs to Timer Engine.

Condition

```
elapsedActiveTime

>=

totalDuration
```

Then

```
notifyComplete()

cancelRemainingAlarms()

markSessionCompleted()

destroyScheduler()
```

Complete notification MUST fire only once.

Exactly at

```
100%
```

Never

95%

Never

90%

Never

predicted completion.

---

# Dynamic Milestone Synchronization

Milestone algorithm remains unchanged.

Notification Engine receives

```
Target milestone times.
```

Example

```
25 sec

35 sec

50 sec

```

Notification Engine does NOT calculate progress.

It only compares

```
targetElapsedTime

vs

elapsedActiveTime
```

Formula

```
remaining

=

targetElapsedTime

-

elapsedActiveTime
```

This single formula guarantees synchronization forever.

---

# Browser Sleep

Browser sleeps

↓

Resume

↓

Recalculate

Computer sleeps

↓

Resume

↓

Recalculate

Extension reloads

↓

Restore session

↓

Recalculate

Browser alarms are never trusted.

The Timer Engine is trusted.

---

# Browser Alarm Rules

Browser alarms are disposable.

Never keep browser alarms forever.

Browser alarms exist only while Running.

Paused

↓

No alarms

Running

↓

Fresh alarms

Reset

↓

No alarms

Completed

↓

No alarms

---

# Notification Trackers

Each session stores

```
startFired

milestonesFired[]

almostFired

completeFired
```

Trackers survive Pause.

Trackers survive Resume.

Trackers DO NOT survive Reset.

Trackers DO NOT survive new Start.

---

# Invariants

The system MUST always satisfy

✓ Timer Engine owns time

✓ Notification Engine owns scheduling

✓ One Start notification

✓ One Almost notification

✓ One Complete notification

✓ Every milestone fires at most once

✓ No notification while paused

✓ No notification after reset

✓ No notification from previous session

✓ No duplicate notification

✓ No early notification

✓ No late notification

✓ No browser drift

✓ No race conditions

✓ Browser alarms always match current timer progress

---

# Claude Code Implementation Requirements

## NEVER

❌ Never calculate notifications from startedAt

❌ Never keep browser alarms during Pause

❌ Never resume previous alarms

❌ Never fire alarm without validating sessionId

❌ Never keep alarms after Reset

❌ Never allow Notification Engine to own elapsed time

❌ Never trust browser alarm timing

❌ Never reuse previous scheduler state

---

## ALWAYS

✅ Timer Engine is the only source of elapsed time

✅ Read elapsedActiveTime every Resume

✅ Cancel every alarm on Pause

✅ Recalculate every remaining notification on Resume

✅ Schedule brand new alarms

✅ Validate sessionId before every notification

✅ Destroy scheduler on Reset

✅ Fire Complete only when Timer Engine reaches 100%

✅ Ignore browser timing if it conflicts with Timer Engine

---

# Acceptance Tests

The implementation is considered correct only if ALL of the following pass.

Scenario 1

```
Start

↓

Pause

↓

Resume
```

Result

Notifications continue normally.

---

Scenario 2

```
Pause

↓

Wait 5 hours

↓

Resume
```

Result

Notifications continue from remaining active time.

---

Scenario 3

```
Pause

↓

Resume

↓

Pause

↓

Resume

↓

Pause

↓

Resume

(1000 times)
```

Result

No drift.

---

Scenario 4

```
Reset while Running
```

Result

No notification survives.

---

Scenario 5

```
Reset while Paused
```

Result

No notification survives.

---

Scenario 6

```
Browser Sleep
```

Result

Remaining time recalculated.

---

Scenario 7

```
Extension Restart
```

Result

Session restored.

Remaining notifications recalculated.

---

Scenario 8

```
Old browser alarm fires
```

Result

Session validation rejects it.

---

# Final Goal

The Notification Engine must never attempt to become another timer.

It is only a synchronization-aware scheduler.

The Timer Engine owns progress.

The Notification Engine owns notification delivery.

Every notification must always reflect the Timer Engine's actual progress, regardless of how many times the user pauses, resumes, resets, or how the browser behaves in the background.


---

# Event Synchronization Contract

This section defines the exact event flow between the Timer Engine and the Notification Engine.

The Notification Engine MUST NEVER perform actions independently.

Every operation must always begin from a Timer Engine state transition.

The Timer Engine is the authority.

The Notification Engine is only a synchronization-aware scheduler.

---

# Event Flow — Start

```
User presses Start
        │
        ▼
Timer Engine creates a new timer session
        │
        ▼
Generate new sessionId
        │
        ▼
Initialize elapsedActiveTime = 0
        │
        ▼
Calculate notification schedule
        │
        ▼
Send schedule to Notification Engine
        │
        ▼
Notification Engine stores schedule
        │
        ▼
Create browser alarms
        │
        ▼
Immediately fire Start notification
        │
        ▼
Running
```

Rules

- Generate a completely new session.
- Destroy any previous scheduler.
- Destroy any remaining browser alarms.
- Reset every notification tracker.
- Never reuse data from a previous timer.

---

# Event Flow — Pause

```
User presses Pause
        │
        ▼
Timer Engine stops active timer
        │
        ▼
Update elapsedActiveTime
        │
        ▼
Send Pause event to Notification Engine
        │
        ▼
Notification Engine cancels every browser alarm
        │
        ▼
Notification Engine saves current notification progress
        │
        ▼
Scheduler becomes idle
```

Rules

The Notification Engine MUST NOT continue counting time.

The Notification Engine MUST NOT fire notifications while paused.

Browser alarms MUST become zero.

The current session MUST remain alive.

Notification trackers MUST remain unchanged.

Milestone progress MUST remain unchanged.

---

# Event Flow — Resume

```
User presses Resume
        │
        ▼
Timer Engine resumes counting
        │
        ▼
Read elapsedActiveTime
        │
        ▼
Notification Engine receives Resume event
        │
        ▼
Calculate remaining time for every notification
        │
        ▼
Ignore completed notifications
        │
        ▼
Create NEW browser alarms
        │
        ▼
Running
```

Rules

Never resume existing alarms.

Always create new alarms.

Always calculate remaining time from elapsedActiveTime.

Never calculate from startedAt.

---

# Event Flow — Reset

```
User presses Reset
        │
        ▼
Timer Engine destroys session
        │
        ▼
Notification Engine receives Reset
        │
        ▼
Cancel every browser alarm
        │
        ▼
Destroy scheduler
        │
        ▼
Clear notification queue
        │
        ▼
Clear trackers
        │
        ▼
Idle
```

Rules

Reset means complete destruction.

Nothing from the previous timer may survive.

---

# Event Flow — Complete

```
elapsedActiveTime >= totalDuration
        │
        ▼
Timer Engine emits Complete
        │
        ▼
Notification Engine validates session
        │
        ▼
Fire Complete notification
        │
        ▼
Cancel remaining browser alarms
        │
        ▼
Destroy scheduler
        │
        ▼
Completed
```

Rules

Complete notification fires exactly once.

Never predict completion.

Only fire after the Timer Engine reports completion.

---

# Synchronization Rules

The Notification Engine must synchronize after EVERY Timer Engine state transition.

State transitions include

- Start
- Pause
- Resume
- Reset
- Complete

Synchronization must always finish before any notification scheduling begins.

The Notification Engine must never assume the Timer Engine state.

Always read the latest Timer Engine state before scheduling.

---

# Alarm Validation Contract

Every browser alarm MUST contain

```
sessionId

notificationType

targetElapsedTime
```

When an alarm fires

Validate

```
alarm.sessionId == currentSession.sessionId
```

If false

```
Discard alarm.
```

Validate current Timer state.

If Timer state is

```
Paused
```

Ignore alarm.

If Timer state is

```
Reset
```

Ignore alarm.

If Timer state is

```
Completed
```

Ignore alarm.

Notifications may only fire while

```
Running
```

---

# Scheduler Rules

The scheduler is stateless.

It does not own timer progress.

Its only responsibilities are

- receive schedule
- create browser alarms
- cancel browser alarms
- recreate browser alarms
- validate alarms
- fire notifications

Nothing more.

---

# Synchronization Formula

The Notification Engine must always calculate notification timing using

```
remainingTime = targetElapsedTime - elapsedActiveTime
```

If

```
remainingTime <= 0
```

Skip notification.

Otherwise

```
browserAlarmTime = Date.now() + remainingTime
```

This formula must be used after every Resume.

Never calculate using

```
startedAt
```

Never calculate using wall-clock elapsed time.

Always use active elapsed time only.

---

# Implementation Constraints

The Notification Engine is NOT allowed to

- own timer progress
- own elapsed time
- own running state
- own pause state
- own completion state

The Notification Engine IS allowed to

- own notification trackers
- own browser alarms
- own scheduler
- own notification delivery

---

# Final Synchronization Guarantee

After implementing this specification, the system must guarantee:

✓ No early notifications

✓ No delayed notifications caused by Pause or Resume

✓ No duplicate notifications

✓ No notifications while paused

✓ No notifications after Reset

✓ No notifications from previous sessions

✓ Browser alarms always represent the current timer state

✓ Infinite Pause/Resume operations without timing drift

✓ Complete notification always fires at exactly 100% active elapsed progress

✓ Notification Engine always stays synchronized with the Timer Engine regardless of browser behavior, computer sleep, extension restart, or delayed browser alarms.


# Implementation Directive for Claude Code

This specification is the authoritative synchronization design for the Notification Engine.

Do not redesign the architecture.

Do not replace any synchronization algorithm.

Do not simplify any lifecycle.

If the current implementation conflicts with this specification, refactor the implementation instead of changing the specification.

Before writing code:

1. Read the entire specification.
2. Explain your implementation plan.
3. Identify conflicts with the current codebase.
4. Implement incrementally while preserving the existing notification algorithm.
5. Verify every acceptance rule before considering the implementation complete.

The notification algorithm is already correct.

Your task is only to redesign and synchronize the Notification Engine with the Timer Engine according to this specification.
