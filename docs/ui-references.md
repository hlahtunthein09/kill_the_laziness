# UI/UX Reference Analysis for FocusFlow AI

**Research goal:** Gather design patterns from similar productivity apps (timer + todo + blocker) to inform tomorrow's UI overhaul for FocusFlow AI.

**Date:** 2026-06-26

---

## 1. Pomofocus — Minimalist Pomodoro Timer

**What it is:** Ultra-simple web-based Pomodoro timer focused on getting users into a session immediately.

**Official:** [pomofocus.app](https://pomofocus.app/)

### UI patterns worth borrowing
- **Giant circular progress timer** in the center of the page
- **Color-coded session states** (work = red, short break = teal, long break = blue)
- **Task list below the timer** — tasks are subordinate to the timer, not competing
- **Minimal controls:** Start / Pause / Reset only
- **Light/Dark theme support**
- **90-day heatmap** for consistency visualization
- **Daily streak counter**

### Relevance to FocusFlow AI
- Our `TimerRing.tsx` already has a ring; consider making it larger and center-stage.
- Current timer page has project/sub-piece names above the timer — good, but the timer itself could dominate more.
- Color-coded sessions could help distinguish focus vs. break states.

---

## 2. Forest — Gamified Focus + Loss Aversion

**What it is:** Mobile-first focus app where a virtual tree grows during a session; leaving the app kills the tree.

**Official:** [forestapp.cc](https://forestapp.cc/)

### UI patterns worth borrowing
- **Nature theme throughout** — soft greens, trees, organic shapes
- **Central visual metaphor** (the growing tree) that represents the session
- **Loss aversion as core mechanic** — tree death is more motivating than rewards
- **Collection/gallery view** — users see their past "forest"
- **Real-world impact** — coins contribute to planting real trees
- **Friends / group focus rooms** for accountability

### Relevance to FocusFlow AI
- We already have a Dev-Fortress concept. Consider making the fortress SVG more central on the dashboard/timer page.
- Fortress health should visibly decay or recover based on focus/distraction behavior.
- Add a "fortress gallery" or history view showing past completed projects as built fortresses.

---

## 3. Freedom — Cross-Platform Distraction Blocker

**What it is:** Website and app blocker with scheduling and locked mode.

**Official:** [freedom.to](https://freedom.to/)

### UI patterns worth borrowing
- **Clean web dashboard** for managing blocklists and sessions
- **Session scheduling:** Start now / Start later / Recurring
- **Gentle blocking page** with friendly butterfly logo instead of harsh error messages
- **Locked Mode** to prevent early disable
- **Focus Sounds** ambient background noise
- **Cross-device sync** of active sessions

### Relevance to FocusFlow AI
- Our extension already has blocking + warn modes. Consider adding a softer blocked page design.
- Schedule focus sessions (already built) should be promoted more prominently in the UI.
- "Locked mode" could be a future premium feature.

---

## 4. Todoist Karma — Soft Gamification in a Task Manager

**What it is:** Lightweight gamification layer on top of a todo app: points, levels, streaks, karma curve graph.

**Official:** [Todoist Karma Help](https://www.todoist.com/help/articles/introduction-to-karma-OgWkWy)

### UI patterns worth borrowing
- **Karma score in top-right corner** — always visible but unobtrusive
- **Hover to reveal karma progress graph**
- **Eight progression levels** with clear thresholds
- **Daily/weekly goal setting** for streaks
- **Vacation mode** to protect streaks
- **Color-coded karma curve** with symbols for tasks added, completed, goals met

### Relevance to FocusFlow AI
- Our dashboard shows level and streak, but the progression system could be more visible.
- Consider adding a small XP/level indicator in the Header.
- Karma curve / activity graph could replace or augment the simple stat cards.

---

## 5. Pomodoro MV3 Browser Extensions

**Examples:**
- [dominhduy09/pomodoro-extension](https://github.com/dominhduy09/pomodoro-extension)
- [earth774/pomodoro-chrome-extension](https://github.com/earth774/pomodoro-chrome-extension)
- [jameskimthing/minimalist-focus-timer](https://github.com/jameskimthing/minimalist-focus-timer)
- [justduyen/Focus-Assistant-Extension](https://github.com/justduyen/Focus-Assistant-Extension)

### UI patterns worth borrowing
- **Glassmorphism / soft shadow popup design**
- **Extension badge counter** showing remaining minutes
- **Circular progress in popup**
- **Template presets:** Classic (25/5), Short (15/3), Long (50/10)
- **Daily statistics** in popup
- **Settings gear icon** to avoid clutter

### Relevance to FocusFlow AI
- Our extension popup currently shows status + open-app link + controls. Could be redesigned to show a mini timer ring.
- Badge counter would let users see remaining time without opening popup.

---

## 6. Combined Todo + Timer Apps

**Examples:**
- [Focus To-Do](https://www.focustodo.cn/)
- [ZenToDo](https://www.zentodo.in/features)
- [Blitzit](https://appslifetime.com/blitzit/)
- [MeTenk Extension](https://extpose.com/ext/baefifnjmlmfcdkmbkdbjiijlpggkoic)
- [Haseeb-MernStack/focusflow-productivity-dashboard](https://github.com/Haseeb-MernStack/focusflow-productivity-dashboard)

### UI patterns worth borrowing
- **Zen Mode:** strip UI down to just current task + timer
- **Timer launches directly from a selected task**
- **Floating / always-visible timer widget**
- **Visual progress circles with haptic feedback**
- **Home screen widgets / Live Activities**
- **Dark/Light mode and custom backgrounds**

### Relevance to FocusFlow AI
- We already combine projects + timer, but the connection could be stronger: clicking a sub-piece could jump straight to `/timer` with that sub-piece active.
- Consider a "focus mode" that hides everything except the timer.

---

## 7. WXT Extension UI Best Practices

**Resources:**
- [WXT Official Examples](https://wxt.dev/examples)
- [WXT Entrypoints Guide](https://wxt.dev/guide/essentials/entrypoints.html)
- [Mastering WXT Entrypoints](https://codevovan.com/wxt-entrypoints-browser-extensions-popup-guide/)
- [Build Modern Browser Extensions with WXT, React and TypeScript](https://dev.to/seryllns_/build-modern-browser-extensions-with-wxt-react-and-typescript-h3h)

### Key takeaways
- Treat popup as a **high-performance SPA** that is destroyed/recreated on every click
- Use **optimistic UI updates**
- Keep CSS scoped and bundle size small
- Use **typed messaging** between popup/background/content scripts
- Use **local storage caching** for instant state recovery

---

## Design Recommendations for FocusFlow AI Tomorrow

### High Priority
1. **Make timer the hero on `/timer`** — larger ring, central position, minimal surrounding chrome
2. **Strengthen project → timer connection** — clicking a sub-piece should focus that sub-piece in the timer
3. **Fortress visualization as primary dashboard motif** — bigger SVG, health/level more prominent
4. **Add extension badge remaining-time counter**
5. **Redesign popup with mini timer ring and cleaner controls**

### Medium Priority
6. **Add a "Zen/Focus Mode"** that hides sidebar/header and shows only timer
7. **Add activity graph / karma curve** to dashboard
8. **Softer blocked page** design with nature theme
9. **Better empty states** with clear CTAs across all pages
10. **Consistent dark mode** using semantic tokens (`bg-card`, `text-foreground`, etc.)

### Low Priority / Future
11. **Group focus rooms** (Plant Together style)
12. **Real-world impact tie-in** (e.g., "Your focus planted X trees")
13. **Locked mode** for strict sessions
14. **Wearable / widget / Live Activity support**

---

## Sources

- [Pomofocus](https://pomofocus.app/)
- [Forest App](https://forestapp.cc/)
- [Freedom](https://freedom.to/)
- [Todoist Karma Help](https://www.todoist.com/help/articles/introduction-to-karma-OgWkWy)
- [dominhduy09/pomodoro-extension](https://github.com/dominhduy09/pomodoro-extension)
- [earth774/pomodoro-chrome-extension](https://github.com/earth774/pomodoro-chrome-extension)
- [jameskimthing/minimalist-focus-timer](https://github.com/jameskimthing/minimalist-focus-timer)
- [justduyen/Focus-Assistant-Extension](https://github.com/justduyen/Focus-Assistant-Extension)
- [Haseeb-MernStack/focusflow-productivity-dashboard](https://github.com/Haseeb-MernStack/focusflow-productivity-dashboard)
- [WXT Examples](https://wxt.dev/examples)
- [WXT Entrypoints Docs](https://wxt.dev/guide/essentials/entrypoints.html)
