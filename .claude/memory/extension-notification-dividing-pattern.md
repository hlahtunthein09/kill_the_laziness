---
name: extension-notification-dividing-pattern
description: Canonical percentage-based dividing pattern for extension focus-session notification stages.
metadata: 
  node_type: memory
  type: project
  originSessionId: 94140101-7468-43f4-8f59-1c2488518ba4
---

# Extension Notification Dividing Pattern

Every focus session is divided into percentage-based stages. Milestones occupy the biggest slice (50% of duration, from 25% to 75%).

## Stage schedule

| Stage     | Elapsed % | Fires at                              |
|-----------|-----------|---------------------------------------|
| Start     | 0% → 25%  | 0% (session start)                    |
| Milestone | 25% → 75% | Evenly distributed inside this phase  |
| Almost    | 75% → 90% | Midpoint = 82.5%                      |
| Complete  | 90% →100% | 100% (actual completion)              |

## Algorithm

```
// Phase boundaries (seconds)
milestoneStart    = totalDuration * 0.25
milestoneDuration = totalDuration * 0.50
almostStart       = totalDuration * 0.75
almostDuration    = totalDuration * 0.15
completeTime      = totalDuration

// Almost fires at midpoint of 75%-90% phase
almostTime = almostStart + (almostDuration * 0.5)  // 82.5%

// Milestone count by total duration
count = getMilestoneCount(totalDuration)

// Spread milestones evenly inside the milestone phase
gap = 100 / (count + 1)

for (let i = 1; i <= count; i++) {
    percent = gap * i                              // percent inside milestone phase
    milestoneTime = milestoneStart + milestoneDuration * (percent / 100)
    notifyAt(milestoneTime)
}
```

## Milestone count by duration

| Total Duration | Milestones |
| -------------- | ---------: |
| 1–2 min        |          1 |
| >2–5 min       |          2 |
| >5–10 min      |          3 |
| >10–20 min     |          4 |
| >20–40 min     |          5 |
| >40–60 min     |          6 |
| >1–2 hr        |          8 |
| >2–4 hr        |         10 |
| >4 hr          |         12 |

## Examples

**1-minute session (60s):**
- Start: 0s
- Milestone phase: 15s – 45s, count = 1 → milestone at 30s
- Almost: 45s + (9s × 0.5) = 49.5s
- Complete: 60s

**5-minute session (300s):**
- Start: 0s
- Milestone phase: 75s – 225s, count = 2 → milestones at 125s (2:05), 175s (2:55)
- Almost: 225s + (45s × 0.5) = 247.5s (4:07.5)
- Complete: 300s

**25-minute session (1500s):**
- Start: 0s
- Milestone phase: 375s – 1125s, count = 4 → milestones at 525s, 675s, 825s, 975s
- Almost: 1125s + (112.5s × 0.5) = 1181.25s
- Complete: 1500s

## Alarm strategy

> **Do not use short periodic alarms.** Chrome MV3 throttles `chrome.alarms` to roughly once per minute; 15s/30s alarms are coalesced or delayed. This causes notifications to land late and can make milestones/almost/complete collide, especially as session duration grows.
>
> **Use per-stage absolute alarms instead.** For every session, create one alarm for each future stage (milestones, almost, complete) at its exact absolute timestamp. When an alarm fires, throw exactly that notification.

### Per-stage alarm rules

| Stage | Alarm name | Fires at |
|---|---|---|
| Start | immediate | On session start |
| Milestones | `focus-milestone-{i}` | `sessionStartTimestamp + milestoneTime * 1000` |
| Almost | `focus-almost` | `sessionStartTimestamp + almostTime * 1000` |
| Complete | `focus-complete` | `sessionStartTimestamp + targetTimeSeconds * 1000` |

### Pause / resume behavior

- On **pause**, clear all pending stage alarms.
- On **resume**, recompute remaining stages from current `sessionElapsed` and recreate their absolute alarms.
- This keeps notifications precise and avoids throttling.

## Tracking rule

Each stage fires **once and only once** per session. Duplicate firing is prevented by per-session tracker state (`startFired`, `milestoneTimesFired`, `almostDoneFired`, `completeFired`).

## Sync semantics (Pause / Resume / Reset / Re-focus)

The notification schedule is based on **session elapsed time**, not wall-clock time.

| Action | Effect |
|--------|--------|
| **Start** | New session. Reset all trackers. Fire Start. |
| **Pause** | Freeze `sessionElapsed`. Preserve all fired trackers. No new notifications. |
| **Resume** | Continue from frozen `sessionElapsed`. Start does **not** re-fire. Already-fired stages stay fired. Remaining stages fire when elapsed reaches their scheduled times. |
| **Reset** | Clear session. Clear all trackers. Next Start is fresh. |
| **Re-focus** | New session (new baselines). Reset trackers. Fire Start. |

### Analogy

Think of it like a **stopwatch for a timed run**:

- **Start** — press start and begin running.
- **Pause** — stopwatch freezes. Distance covered stays the same. No progress happens while resting.
- **Resume** — continue running from the same spot. Milestones on the track are still at the same distances.
- **Reset** — go back to the starting line and clear the stopwatch.

Wall-clock time can exceed allocated duration because of pauses. The engine only counts active focus time.

## Notes

- 1-minute sessions are for testing only; real focus sessions are longer.
- Milestones never overlap Start or Almost phases.
- Almost always fires at exactly 82.5% of total duration.
- Complete fires only when the session actually finishes (sub-piece reaches 0 or project target is reached).

## Related

- [[notification-engine-rebuild-spec]]
- [[extension-notification-b-split]]
- [[extension-notification-b-diagnosis]]
- `.claude/skills/extension-notifications/SKILL.md`
