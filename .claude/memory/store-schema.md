# Store Schema

Current Zustand store shape and actions for FocusFlow AI.

## Store File
- `lib/store/useFocusStore.ts` — combines slices with `persist` middleware.
- Storage key: `ff_focus_store`.

## Slices
- `projectSlice` — `lib/store/slices/projectSlice.ts`
- `settingsSlice` — `lib/store/slices/settingsSlice.ts`
- `distractionSlice` — `lib/store/slices/distractionSlice.ts`

## Project Slice (relevant for sub-pieces)

### State
- `projects: Project[]`
- `activeProjectId: string | null`

### Actions
- `addProject(project)` — create a new project
- `updateProject(id, updates)` — update project fields
- `deleteProject(id)` — remove project
- `setActiveProject(id)` — set active project
- `addSubPiece({ projectId, name, allocatedMinutes, order })` — create sub-piece under a project
- `updateSubPiece(projectId, subPieceId, updates)` — update sub-piece fields
- `deleteSubPiece(projectId, subPieceId)` — remove sub-piece
- `reorderSubPieces(projectId, orderedIds)` — reorder sub-pieces
- `updateSubPieceStatus(projectId, subPieceId, status)` — set status
- `incrementProjectTime(projectId, seconds)` — add elapsed time
- `incrementSubPieceTime(projectId, subPieceId, seconds)` — add elapsed time
- `completeSubPiece(projectId, subPieceId)` — mark completed

### Selectors / Helpers
- `getActiveProject()`
- `getProjectById(id)`
- `getSubPieceById(projectId, subPieceId)`
- `getCompletedSubPiecesCount(projectId)`
- `getTotalAllocatedMinutes(projectId)`
- `getProjectProgress(projectId)` — % of completed sub-pieces

## Types
- See `lib/types/index.ts` for full `Project`, `SubPiece`, `AppSettings`, etc.

## Usage in Components
```tsx
const projects = useFocusStore((s) => s.projects);
const addSubPiece = useFocusStore((s) => s.addSubPiece);
// or for actions outside render:
useFocusStore.getState().addSubPiece({ ... });
```
