# Research: Real-World Todo + Timer + Notification App Architectures

## Sources
- Context7 `/vercel/next.js` — localStorage in client components, hydration safety
- Context7 `/wxt-dev/wxt` — extension entrypoints (background, popup, content script)
- WebFetch: `dominhduy09/pomodoro-extension` — MV3 pomodoro extension
- WebFetch: `theluckystrike/focus-mode-pro-oss` — blocker + pomodoro extension

## Key Findings

### 1. Pomodoro Extension Architecture (`dominhduy09/pomodoro-extension`)
- **Files**: `manifest.json`, `service_worker.js`, `popup.html`, `popup.css`, `popup.js`, `offscreen.html`, `offscreen.js`
- **Timer ownership**: Service worker owns all timer state in `chrome.storage.local`.
- **Popup role**: Popup only renders UI, does not drive the timer.
- **Communication**: Popup ↔ worker via `chrome.runtime.sendMessage`.
- **Notifications**: Service worker sends desktop notifications on alarm.
- **Alarms**: `chrome.alarms` for session ends and badge updates.

### 2. Focus Mode Extension Architecture (`theluckystrike/focus-mode-pro-oss`)
- **Blocking**: Uses `tabs`, `webNavigation`, `storage` permissions.
- **Block page**: Shows motivational quotes on blocked site.
- **Privacy**: Everything local, no third-party services.
- **Timer + blocking unified**: Both share `chrome.alarms` API.

### 3. Next.js App Router Patterns
- Use `"use client"` for components that touch `localStorage`/stores.
- Use lazy state init + `suppressHydrationWarning` to avoid hydration mismatches.

### 4. WXT Extension Patterns
- `defineBackground()` for service worker.
- `defineContentScript()` for injected scripts.
- Popup as standard HTML/TSX entrypoint.
- Use `browser.*` APIs via `webextension-polyfill`.

## Implications for FocusFlow AI

1. **Timer must live in extension background** for off-screen persistence.
2. **Web app and extension share storage state** via messaging + storage sync.
3. **Popup is read-only/control-only**, not the timer source of truth.
4. **Block page should show motivational copy**, not just "blocked".
5. **Client components are required** for any browser API usage in Next.js.

## Recommended Smaller Piece Breakdown

### Web App Pieces
1. Project type + project store only
2. Sub-piece store + CRUD only
3. Settings store only
4. App shell + Burmese navigation layout
5. Add project form UI
6. Project list UI
7. Project detail page shell
8. Sub-piece list UI
9. Timer display component (presentational)
10. Timer engine hook (`requestAnimationFrame`)
11. Start/pause timer integration
12. Session complete modal
13. Motivation message bank
14. Toast notification component
15. Dashboard widgets
16. Distraction log store + UI
17. Activity heatmap
18. Productivity charts

### Extension Pieces
1. WXT setup + manifest only
2. Background service worker skeleton
3. Extension storage wrapper (`chrome.storage.local`)
4. Tab monitoring + URL checking
5. Block page HTML
6. Warning overlay content script
7. Notification helper
8. Popup skeleton
9. Popup timer display
10. Web-to-extension messaging
11. Timer sync protocol
12. Off-screen notification triggers

## 5. Minimal Todo Store Pattern (`jnsahaj/todo`)
A real minimal Zustand + persist store is only ~50 lines:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (text) =>
        set((state) => ({
          todos: [...state.todos, { id: crypto.randomUUID(), text, completed: false }],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        })),
      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
    }),
    {
      name: "todo-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

Lesson: one focused store file can handle a full feature domain.

## 6. Zustand Slices Pattern (Context7 `/pmndrs/zustand`)
Instead of many separate stores, combine slices into one bounded store:

```typescript
import { create, StateCreator } from 'zustand'

const createBearSlice: StateCreator<BearSlice & FishSlice, [], [], BearSlice> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
})

const useBoundStore = create<BearSlice & FishSlice & SharedSlice>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
  ...createSharedSlice(...a),
}))
```

Lesson: fewer stores = smaller codebase, easier sync between domains.

## Updated Recommendation: Keep Codebase Small

### Refactor Existing Stores
Combine `useProjectStore`, `useSettingsStore`, `useDistractionStore` into ONE `useFocusStore` using slices pattern. This reduces files from 3 stores to 1 store + 3 slice files.

### Minimal MVP Feature Set
Only these features for first usable version:

**Web App:**
1. Add project
2. Add sub-piece to project
3. Set timer on sub-piece
4. Start/pause/reset timer
5. Show motivational message while timer runs
6. Simple list of projects + sub-pieces

**Extension:**
1. WXT setup
2. Background timer sync
3. Block/warn on YouTube Shorts / Instagram Reels
4. Off-screen notification when timer completes
5. Popup showing active timer

**Deferred (after MVP):**
- Gamification / Dev-Fortress
- Analytics charts
- Activity heatmap
- Achievement system
- Data export/import
- Multiple themes

## Next Action
User should approve the refactor to a single store + minimal MVP roadmap, then select the first tiny piece.
