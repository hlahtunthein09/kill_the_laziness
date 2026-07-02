# Skill: Sub-piece Budget — Store Layer (Piece A)

## Goal
Enforce that the sum of sub-piece allocated time can never exceed the project's `targetTimeSeconds`. Add a budget getter and guard the store mutations. UI enforcement comes later (Piece B/C); this is the store safety net + helper.

## Scope
- Modify ONLY `lib/store/slices/projectSlice.ts` and `lib/store/__tests__/useFocusStore.test.ts`.
- Do NOT touch components or forms.

## Background (already in the slice)
- `getTotalAllocatedMinutes(projectId)` already exists — sums `allocatedMinutes` across all sub-pieces. Reuse it.
- `addSubPiece(subPiece) => SubPiece` appends a sub-piece.
- `updateProject(id, updates)` shallow-merges updates.
- Budget basis: ALL sub-pieces count (including completed).

## Implementation

### 1. New getter `getRemainingBudgetSeconds`
- Add to `ProjectSlice` interface: `getRemainingBudgetSeconds: (projectId: string) => number;`
- Implement in the getters area:
  ```
  getRemainingBudgetSeconds: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return 0;
    const allocatedSeconds = get().getTotalAllocatedMinutes(projectId) * 60;
    return Math.max(0, project.targetTimeSeconds - allocatedSeconds);
  },
  ```

### 2. Guard `addSubPiece` (clamp to remaining budget)
- Before building `newSubPiece`, compute remaining minutes from the getter and clamp:
  ```
  const remainingMinutes = Math.floor(get().getRemainingBudgetSeconds(subPiece.projectId) / 60);
  const finalMinutes = Math.max(0, Math.min(subPiece.allocatedMinutes, remainingMinutes));
  ```
- Use `finalMinutes` for `newSubPiece.allocatedMinutes`. This guarantees the invariant even if a caller bypasses the UI. (The UI in Piece B blocks the ≤0 case; the store just never overflows.)

### 3. Floor `updateProject` target at allocated sum
- In `updateProject`, if `updates.targetTimeSeconds` is provided, floor it at the current allocated sum so a project's target can never drop below what's already allocated:
  ```
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== id) return p;
        let next = { ...p, ...updates };
        if (updates.targetTimeSeconds !== undefined) {
          const allocatedSeconds =
            p.subPieces.reduce((sum, sp) => sum + sp.allocatedMinutes, 0) * 60;
          next = { ...next, targetTimeSeconds: Math.max(updates.targetTimeSeconds, allocatedSeconds) };
        }
        return next;
      }),
    }));
  },
  ```
  (Compute allocated inline from `p.subPieces` since `get()` inside `set` mapper is avoidable; either is fine.)

## Tests (`lib/store/__tests__/useFocusStore.test.ts`)
Add a describe block for budget:
- `getRemainingBudgetSeconds`: project target 3600s (1h), add sub-piece 25 min → remaining 2100s (35 min).
- `addSubPiece` clamp: target 3600s, existing sub-pieces summing 50 min, add a 25-min piece → stored `allocatedMinutes === 10` (only 10 min remained). Assert total allocated never exceeds 60.
- `addSubPiece` at full budget: remaining 0 → new piece stored with `allocatedMinutes === 0` (invariant held; UI prevents this case).
- `addSubPiece` within budget: unchanged value stored.
- `updateProject` floor: project with 40 min allocated, call `updateProject(id, { targetTimeSeconds: 600 })` (10 min) → stored `targetTimeSeconds === 2400` (40 min floor).
- `updateProject` raise: target 3600 → 7200 succeeds (7200 stored).
- Keep all existing store tests passing.

## Verify
- `npx tsc --noEmit`
- `npx vitest run lib/store/__tests__/useFocusStore.test.ts`

## Done criteria
Both pass; store never lets allocated exceed target; target can't drop below allocated; getter returns remaining seconds.
