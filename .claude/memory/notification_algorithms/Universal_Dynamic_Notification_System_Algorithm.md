# Universal Dynamic Notification System Algorithm

## Goal

Design a notification system that works for **any timer duration**
(nanoseconds to extremely large durations) without hardcoded tables.

## Notification Lifecycle

``` text
User presses Start
        │
        ▼
 START (Immediately)
        │
        ▼
 Milestone Phase (25% → 75%)
        │
        ├── Dynamic Milestone #1
        ├── Dynamic Milestone #2
        ├── ...
        ▼
 ALMOST (82.5%)
        ▼
 COMPLETE (100%)
```

------------------------------------------------------------------------

## Phase Definitions

Let:

-   `T` = total timer duration (any unit)

  Phase              Range
  ------------ -----------
  Start                 0%
  Milestones     25% → 75%
  Almost         75% → 90%
  Complete            100%

### Time boundaries

``` text
milestoneStart = T × 0.25
milestoneEnd   = T × 0.75

almostStart    = T × 0.75
almostEnd      = T × 0.90

finish         = T
```

------------------------------------------------------------------------

# Start Notification

Fire **immediately** when the user presses Start.

``` text
trigger = 0%
```

No calculations required.

------------------------------------------------------------------------

# Milestone System

## Milestone Zone

Only use the middle 50% of the timer.

``` text
25% ----------------------------- 75%
```

Duration:

``` text
M = T × 0.50
```

## Dynamic Milestone Count

Use a logarithmic scaling function.

Variables:

-   `B` = base duration (recommended: 60 seconds)
-   `α` = scaling factor (recommended: 0.75)

Formula:

``` text
N = max(
    1,
    floor(
        α × log2(T / B + 1)
    ) + 1
)
```

Optional safety cap:

``` text
N = min(N, MaxMilestones)
```

Example:

``` text
MaxMilestones = 20
```

This prevents excessive notifications for huge timers.

## Even Distribution

Once `N` is known:

``` text
gap = 50 / (N + 1)
```

Milestone percentage:

``` text
position(i) = 25 + gap × i

i = 1 ... N
```

Convert percentage to actual time:

``` text
milestoneTime(i) =
T × position(i) / 100
```

### Example

Suppose:

``` text
N = 5
```

Then

``` text
gap = 50 / 6
    = 8.333%
```

Milestones

``` text
33.33%
41.67%
50.00%
58.33%
66.67%
```

------------------------------------------------------------------------

# Almost Notification

Fire **once** at the exact middle of the Almost phase.

Almost phase:

``` text
75% → 90%
```

Middle:

``` text
(75 + 90) / 2

= 82.5%
```

Formula:

``` text
almostTime = T × 0.825
```

------------------------------------------------------------------------

# Complete Notification

Fire **only when the timer is actually finished**.

``` text
trigger = 100%
```

Formula:

``` text
completeTime = T
```

Never trigger at 95%.

------------------------------------------------------------------------

# Complete Algorithm

``` pseudo
INPUT:
    totalDuration = T

CONSTANTS:
    BASE_DURATION = 60 seconds
    ALPHA = 0.75
    MAX_MILESTONES = 20

START:
    Notify(Start)

Calculate:

milestoneStart = T * 0.25
milestoneEnd   = T * 0.75

N =
max(
    1,
    floor(ALPHA * log2(T / BASE_DURATION + 1))
    + 1
)

N = min(N, MAX_MILESTONES)

gap = 50 / (N + 1)

for i = 1 to N

    percent = 25 + gap * i

    notifyTime = T * percent / 100

    schedule Milestone notification

schedule Almost notification

time = T * 0.825

schedule Complete notification

time = T
```

------------------------------------------------------------------------

# Design Principles

-   Start is event-based (button press).
-   Milestones scale dynamically using a logarithmic formula.
-   Milestones are evenly distributed inside 25--75%.
-   Almost always occurs at 82.5%.
-   Complete only occurs at 100%.
-   No hardcoded milestone tables.
-   Works for any duration as long as all values use the same unit.
