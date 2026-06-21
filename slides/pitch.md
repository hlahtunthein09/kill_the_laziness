---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->

# Who's my person?

- A developer who works mostly in the browser
- Opens YouTube/Instagram/TikTok “just for one minute”
- Wants to ship projects but keeps losing deep-work time to infinite feeds

<!-- 20s -->

---

<!-- slide 2 -->

# Their problem

- Short-form content is designed to hijack attention
- Context switching destroys flow and stretches deadlines
- Willpower alone fails — there is no accountability layer in the browser

<!-- 20s -->

---

<!-- slide 3 -->

# What I built

- FocusFlow AI (Kill The Laziness) — dashboard + browser extension
- Create projects, break them into timed sub-pieces, track real progress
- Extension blocks or warns on forbidden sites and logs every distraction attempt

<!-- 20s -->

---

<!-- slide 4 -->

# How I built it

- **Dashboard:** Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind CSS 4
- **UI/UX:** shadcn/ui · Framer Motion · Recharts · pastel nature theme
- **State:** Zustand 5 with persist, `requestAnimationFrame` timer, drift recovery
- **Extension:** WXT Manifest V3 · service worker tab monitoring · content-script overlays

<!-- 20s -->

---

<!-- slide 5 -->

# Why it matters

- Turns focus from a willpower battle into a reproducible system
- Meets developers inside their existing browser workflow
- Gamification + analytics make progress visible, rewarding, and harder to ignore

<!-- 20s -->

---

<!-- slide 6 -->

# Done checklist

- [x] proposal.md with persona, problem, and definition of done
- [x] Next.js dashboard scaffold with pastel nature theme
- [x] project/sub-piece timer state with Zustand persist
- [x] extension tab monitoring + strict redirect + warn overlay
- [x] focus sync content script for off-screen notifications
- [x] extension popup showing timer state names
- [ ] dashboard analytics charts (Recharts)
- [ ] full Vitest test suite passing
- [ ] README.md with setup and screenshots

<!-- 20s -->
