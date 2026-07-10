# Memory Index

This file loads all project memory files into context for each session.

## Project Instructions
- [Workflow Rules](workflow.md) — piece-by-piece process, sizing thresholds, roadmap
- [Conventions](conventions.md) — language, colors, state, naming, TypeScript rules
- [Progress](progress.md) — current phase, completed pieces, next action
- [Verification Issues 2026-06-25](verification-issues-2026-06-25.md) — issues/observations from Playwright MCP verification session

## Architecture & Research
- [Architecture Research](architecture-research.md) — real-world extension/app patterns and store slice recommendations
- [Notification Engine Refactor Plan](notification-engine-refactor-plan.md) — lego-block architecture with Active Session Token, per-stage absolute alarms, and 8-phase implementation order
- [Extension Notification Dividing Pattern](extension-notification-dividing-pattern.md) — canonical percentage-based stage schedule + alarm strategy

## UI Patterns
- [UI Conventions](ui-conventions.md) — current form/card patterns, theme usage, Burmese label style

## Data Layer
- [Store Schema](store-schema.md) — current Zustand `useFocusStore` shape, slices, and actions
- [Sync Protocol](sync-protocol.md) — web app ↔ extension timer sync protocol

## Resume Points
- [Notification Sync Solution Plan](notification-sync-solution-plan.md) — analyzed implementation plan for Timer Engine ↔ Notification Engine synchronization per v2 spec; ready to implement
- [Timer Controls and Notification Sync](timer-controls-and-notifications-sync.md) — current wiring between `useTimer` controls and the extension notification system, with code pieces and known sync gaps
- [Native Notification Tiers Resume](native-notification-tiers-resume.md) — current state and next action for the motivational native notification work
- [Project/Sub-piece Audit Resume](project-subpiece-audit-resume.md) — project/sub-piece logic audit findings and next fix (UI start-time validation)
- [Notification Engine Rewrite Resume](notification-engine-rewrite-resume.md) — rewrite extension notification engine to follow Universal Dynamic Notification System Algorithm.md exactly; pause/resume/syncing out of scope for this piece

## Future Specs (to be filled as pieces progress)
- [Timer Behavior](timer-behavior.md) — timer modes and edge cases
- [Notification Spec](notification-spec.md) — motivational message tiers
- [Gamification Spec](gamification-spec.md) — XP sources, levels, achievements
- [Fortress SVG Spec](fortress-svg-spec.md) — Dev-Fortress SVG component specs
- [Analytics Queries](analytics-queries.md) — data aggregation patterns
- [Extension Architecture](extension-architecture.md) — extension file structure and messaging
- [Schedule Spec](schedule-spec.md) — scheduled focus sessions data model and integration plan
- [Playwright MCP Plan](playwright-mcp-plan.md) — lightweight browser verification plan using Playwright MCP server
