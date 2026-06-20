# FocusFlow AI — Reference Library

This file stores project-specific references: similar apps, real-world implementations, tutorials, and design inspiration for FocusFlow AI.

## Similar Apps

| App | URL | Why It Matters |
|-----|-----|----------------|
| Forest | https://www.forestapp.cc | Gamified focus timer with tree-growing visualization; reference for "Dev-Fortress" metaphor |
| Freedom | https://freedom.to | Cross-platform website/app blocker with synchronized blocking; sync inspiration |
| Cold Turkey Blocker | https://getcoldturkey.com | Strictest system-level blocker; reference for "strict mode" UX |
| RescueTime | https://www.rescuetime.com | Automatic time tracking + productivity scoring + FocusTime sessions |
| Pomofocus | https://pomofocus.io | Minimalist web Pomodoro with task list; clean timer UI reference |
| Todoist | https://todoist.com | Karma points, levels, streaks — lightweight gamification reference |
| Habitica | https://habitica.com | Full RPG gamification (HP/XP/quests/parties); deepest gamification reference |
| LeechBlock | https://www.proginosko.com/leechblock.html | Free open-source browser extension with schedule-based blocking |
| Clockify | https://clockify.me | Hierarchical timers (project > task > subtask) + Pomodoro |

## GitHub Examples

| Repo | URL | What to Learn |
|------|-----|---------------|
| pomodoro-extension | https://github.com/dominhduy09/pomodoro-extension | MV3 Pomodoro with `chrome.alarms`, notifications, daily stats, badge counter |
| marinara (MV3 port) | https://github.com/vintageplayer/marinara | React + TypeScript + Tailwind extension; history tracking, data export |
| focus-mode-pro-oss | https://github.com/theluckystrike/focus-mode-pro-oss | Website blocker + Pomodoro; schedules, whitelist, stats, streaks |
| Focus-Assistant-Extension | https://github.com/justduyen/Focus-Assistant-Extension | Privacy-focused MV3 blocker with Declarative Net Request |
| shorts-detox-web-extension | https://github.com/sg172003/shorts-detox-web-extension | SPA-safe blocking for YouTube Shorts and Instagram Reels |
| Stop-Brain-Rot-Extension | https://github.com/Frans0000/Stop-Brain-Rot-Extension | Simple URL-based video distraction blocker |
| Distraction-Blocker | https://github.com/PrabodhGyawali/Distraction-Blocker | Blocks YouTube home thumbnails and Shorts via content script |
| LeechBlockNG | https://github.com/proginosko/LeechBlockNG | Mature feature-rich blocker: schedules, timers, keywords, delay pages |
| vite-web-extension | https://github.com/JohnBra/vite-web-extension | Vite + React + TypeScript MV3 boilerplate |
| Habitica | https://github.com/Habitica/habitica | Large-scale React gamification; progression system reference |

## Tutorials & Articles

- [Chrome Extension: How to Build a Website Blocker](https://developer.chrome.com/docs/extensions/mv3/getstarted/) — Official MV3 getting started with `declarativeNetRequest`
- [Content Scripts in Chrome Extensions: Complete Tutorial](https://chromegoldmine.com/blog/how-to-build-chrome-extensions/content-scripts/) — SPA navigation mistakes, MutationObserver, `run_at` timing
- [How to Detect Page Navigation on YouTube](https://stackoverflow.com/questions/34077641/how-to-detect-page-navigation-on-youtube-and-modify-its-appearance-seamlessly) — `yt-navigate-start` / `yt-navigate-finish` events
- [Build SVG Circular Progress Component in React](https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/) — `stroke-dashoffset` timer rings without dependencies
- [Framer Motion Confetti Effects Case Study](https://www.yeti.co/lab-case-studies/framer-motion-confetti-effects) — Combining Framer Motion animations with confetti celebrations
- [Forest Gamification Case Study](https://trophy.so/blog/forest-gamification-case-study) — Sunk cost, IKEA effect, positive reinforcement in Forest
- [12 Apps Using Gamification for Productivity](https://saasdesigner.com/12-apps-using-gamification-to-boost-habits-productivity/) — Comparative gamification mechanics

## Implementation Patterns

| Pattern | Resource | Notes |
|---------|----------|-------|
| Background timers in MV3 | https://developer.chrome.com/docs/extensions/reference/api/alarms | `chrome.alarms.create()` / `onAlarm` — reliable because service workers are ephemeral |
| System notifications | https://developer.chrome.com/docs/extensions/reference/api/notifications | Desktop alerts even when popup is closed; supports action buttons |
| Fast URL blocking | https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest | Toggle dynamic rules without content script overhead |
| Extension storage | https://developer.chrome.com/docs/extensions/reference/api/storage | `chrome.storage.local` / `sync` with `onChanged` events |
| Web page ↔ extension messaging | https://developer.chrome.com/docs/extensions/mv3/messaging#external-webpage | Requires `externally_connectable` manifest entry |
| SPA navigation detection | Stack Overflow link above | YouTube events + `MutationObserver` for Instagram/others |
| Contribution heatmap | https://github.com/grubersjoe/react-activity-calendar | GitHub-style heatmap; adapt to pastel teal palette |
| Confetti celebrations | https://github.com/catdad/canvas-confetti | High-performance confetti; preferred over DOM particles |
| Next.js static export | https://nextjs.org/docs/app/building-your-application/deploying/static-export | `output: 'export'` for extension popup reuse |
| Shadcn charts | https://ui.shadcn.com/charts | Recharts-based components for productivity stats |

## Design References

- [Shadcn UI Dashboard Example](https://ui.shadcn.com/examples/dashboard) — Official Next.js dashboard with sidebar, cards, charts
- [Shadcn UI Blocks](https://ui.shadcn.com/blocks) — Pre-built dashboard layout blocks
- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors) — `teal`, `emerald`, `sky`, `stone`, `amber` scales
- [Forest App Design](https://www.forestapp.cc) — Nature-themed calm focus UI
- [Habitica UI](https://habitica.com) — RPG HP/XP bars, level badges, quest cards
- [Duolingo Streak UI](https://www.duolingo.com) — Flame streak, XP progress, leaderboards
- [Pomofocus Interface](https://pomofocus.io) — Minimalist timer + task list
- [Headspace App Design](https://www.headspace.com) — Soft pastel gradients, breathing circles
- [Lucide Icons](https://lucide.dev) — `TreePine`, `Leaf`, `Waves`, `Sun`, `Sprout`, `Mountain`

## Recommended Color Palette

| Role | Tailwind Class | Hex |
|------|---------------|-----|
| Background | `bg-teal-50` | `#f0fdfa` |
| Primary (Mint) | `bg-teal-500` | `#14b8a6` |
| Secondary (Ocean) | `bg-sky-500` | `#0ea5e9` |
| Accent (Sand) | `bg-amber-200` | `#fde68a` |
| Success (Forest) | `bg-emerald-400` | `#34d399` |
| Text Primary | `text-stone-900` | `#1c1917` |
| Text Secondary | `text-stone-500` | `#78716c` |
| Card Surface | `bg-white` + `border-stone-200` | `#ffffff` / `#e7e5e4` |
| Heatmap Scale | teal-50 → teal-500 | `#f0fdfa` → `#14b8a6` |

## Key Differentiation Opportunities

Most existing apps don't combine all three of FocusFlow's core features:

1. **Hierarchical timers** — project count-up + sub-piece countdown (most apps use flat timers)
2. **Meaningful gamification** — a visual "Dev-Fortress" that grows with completion, not just points
3. **Cross-context sync** — real-time bidirectional sync between web app `localStorage` and extension `chrome.storage`

## Tech Stack Context7 IDs

For API details while coding:

| Topic | Context7 Library ID |
|-------|---------------------|
| Next.js App Router | `/vercel/next.js` |
| WXT (extension build) | `/wxt-dev/wxt` |
| Framer Motion | `/grx7/framer-motion` |
| Zustand | `/pmndrs/zustand` |
| shadcn/ui | `/shadcn-ui/ui` |
| WebExtension Polyfill | `/mozilla/webextension-polyfill` |
| WebExtensions (MDN) | `/websites/developer_mozilla_en-us_mozilla_add-ons_webextensions` |
