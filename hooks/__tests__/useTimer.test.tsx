import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render, screen, waitFor } from '@testing-library/react'
import { useTimer } from '../useTimer'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { DEFAULT_APP_SETTINGS } from '@/lib/constants'

// Test harness component that renders hook values to the DOM so
// React 19 state updates from useEffect are properly reflected.
function TimerTestHarness({ projectId, subPieceId }: { projectId: string; subPieceId?: string }) {
  const timer = useTimer(projectId, subPieceId)
  return (
    <div>
      <span data-testid="projectElapsed">{timer.projectElapsed}</span>
      <span data-testid="subPieceRemaining">{timer.subPieceRemaining}</span>
      <span data-testid="isRunning">{timer.isRunning ? 'true' : 'false'}</span>
      <button data-testid="start" onClick={timer.start}>Start</button>
      <button data-testid="pause" onClick={timer.pause}>Pause</button>
      <button data-testid="reset" onClick={timer.reset}>Reset</button>
      <button data-testid="resetToZero" onClick={timer.resetToZero}>Reset to Zero</button>
      <button data-testid="reinitialize" onClick={timer.reinitialize}>Reinitialize</button>
    </div>
  )
}

describe('useTimer', () => {
  let rafCallbacks: Map<number, FrameRequestCallback>
  let rafId = 0
  let now = 0

  beforeEach(() => {
    // Reset store
    useFocusStore.setState({
      projects: [],
      activeProjectId: null,
      settings: { ...DEFAULT_APP_SETTINGS },
      logs: [],
    })

    // Clear localStorage
    localStorage.clear()

    // Mock RAF
    rafCallbacks = new Map()
    rafId = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafId += 1
      rafCallbacks.set(rafId, cb)
      return rafId
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafCallbacks.delete(id)
    })

    // Mock Date.now without replacing the Date constructor
    now = 0
    vi.spyOn(Date, 'now').mockImplementation(() => now)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // Helper to flush all pending RAF callbacks (used to prime the timer after start)
  const flushRaf = async () => {
    const callbacks = Array.from(rafCallbacks.entries())
    rafCallbacks.clear()
    if (callbacks.length > 0) {
      await act(async () => {
        callbacks.forEach(([, cb]) => cb(now))
      })
    }
  }

  // Helper to advance time by N seconds via RAF.
  // Each call to the RAF callback may schedule another RAF, so we loop until no more callbacks.
  const advanceTime = async (seconds: number) => {
    const stepMs = 1000
    const totalSteps = Math.ceil(seconds * 1000 / stepMs)
    for (let step = 0; step < totalSteps; step++) {
      now += stepMs
      // Flush RAF callbacks until none are scheduled (each callback may schedule another)
      let safety = 0
      while (rafCallbacks.size > 0 && safety < 10) {
        safety++
        const callbacks = Array.from(rafCallbacks.entries())
        rafCallbacks.clear()
        await act(async () => {
          callbacks.forEach(([, cb]) => cb(now))
        })
      }
    }
  }

  const createProjectWithSubPiece = () => {
    const project = useFocusStore.getState().addProject({
      name: 'Test Project',
      description: '',
      color: 'mint',
      targetTimeSeconds: 3600,
    })
    const subPiece = useFocusStore.getState().addSubPiece({
      projectId: project.id,
      name: 'Task 1',
      allocatedMinutes: 2, // 120 seconds
      order: 0,
    })
    return { project, subPiece }
  }

  describe('project-only timer (no subPieceId)', () => {
    it('starts with projectElapsed at 0 for a fresh session', () => {
      const { project } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id))

      expect(result.current.projectElapsed).toBe(0)
      expect(result.current.isRunning).toBe(false)
    })

    it('restores projectElapsed from totalTimeSeconds on mount for continuity', () => {
      const { project } = createProjectWithSubPiece()
      // Seed the store with 120 seconds of prior time, no active session
      useFocusStore.getState().incrementProjectTime(project.id, 120)

      const { result } = renderHook(() => useTimer(project.id))

      // projectElapsed should equal the persisted totalTimeSeconds (120)
      expect(result.current.projectElapsed).toBe(120)
      expect(result.current.isRunning).toBe(false)
    })

    it('starts with projectElapsed at store totalTimeSeconds when no active session', () => {
      const { project } = createProjectWithSubPiece()
      // Seed the store with some elapsed time
      useFocusStore.getState().incrementProjectTime(project.id, 120)

      const { result } = renderHook(() => useTimer(project.id))

      // projectElapsed should start from store total (continuity), not 0
      expect(result.current.projectElapsed).toBe(120)
      expect(result.current.isRunning).toBe(false)
    })

    it('increments project elapsed from store total when no active session', async () => {
      const { project } = createProjectWithSubPiece()
      // Seed store with prior time
      useFocusStore.getState().incrementProjectTime(project.id, 300)

      const { result } = renderHook(() => useTimer(project.id))
      expect(result.current.projectElapsed).toBe(300)

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(5)

      // projectElapsed counts up from store total (300 + 5 = 305)
      expect(result.current.projectElapsed).toBe(305)
      // Store total should be 300 + 5 = 305
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(305)
    })

    it('increments project elapsed from 0 when started', async () => {
      const { project } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id))

      act(() => result.current.start())
      expect(result.current.isRunning).toBe(true)
      await flushRaf() // prime the timer (first RAF sets lastTickRef, delta=0)

      await advanceTime(3)

      expect(result.current.projectElapsed).toBe(3)
      expect(result.current.subPieceRemaining).toBe(0) // no sub-piece
    })

    it('pauses and stops incrementing', async () => {
      const { project } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(2)
      expect(result.current.projectElapsed).toBe(2)

      act(() => result.current.pause())
      expect(result.current.isRunning).toBe(false)

      // Advance more time — should not increment
      await advanceTime(2)
      expect(result.current.projectElapsed).toBe(2)
    })

    it('resumes from paused state', async () => {
      const { project } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(2)
      expect(result.current.projectElapsed).toBe(2)

      act(() => result.current.pause())

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(3)
      expect(result.current.projectElapsed).toBe(5)
    })

    it('persists session with project and sub-piece names on pause', async () => {
      const { project, subPiece } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(3)

      act(() => result.current.pause())

      const raw = localStorage.getItem('ff_active_session')
      expect(raw).toBeTruthy()
      const session = JSON.parse(raw!)
      expect(session.projectId).toBe(project.id)
      expect(session.projectName).toBe('Test Project')
      expect(session.subPieceId).toBe(subPiece.id)
      expect(session.subPieceName).toBe('Task 1')
      expect(session.isRunning).toBe(false)
    })

    it('persists session with targetTimeSeconds on pause', async () => {
      const { project, subPiece } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(3)

      act(() => result.current.pause())

      const raw = localStorage.getItem('ff_active_session')
      expect(raw).toBeTruthy()
      const session = JSON.parse(raw!)
      expect(session.targetTimeSeconds).toBe(3600)
    })

    it('persists session with project name only when no sub-piece', async () => {
      const { project } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(3)

      act(() => result.current.pause())

      const raw = localStorage.getItem('ff_active_session')
      expect(raw).toBeTruthy()
      const session = JSON.parse(raw!)
      expect(session.projectId).toBe(project.id)
      expect(session.projectName).toBe('Test Project')
      expect(session.subPieceId).toBeUndefined()
      expect(session.subPieceName).toBeUndefined()
      expect(session.isRunning).toBe(false)
    })

    it('persists session to localStorage every 5 seconds', async () => {
      const { project } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(6)

      const raw = localStorage.getItem('ff_active_session')
      expect(raw).toBeTruthy()
      const session = JSON.parse(raw!)
      expect(session.projectId).toBe(project.id)
      expect(session.isRunning).toBe(true)
      expect(session.projectElapsed).toBeGreaterThanOrEqual(5)
    })

    it('clears localStorage on pause', async () => {
      const { project } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(6)
      expect(localStorage.getItem('ff_active_session')).toBeTruthy()

      act(() => result.current.pause())
      const raw = localStorage.getItem('ff_active_session')
      expect(raw).toBeTruthy()
      const session = JSON.parse(raw!)
      expect(session.isRunning).toBe(false)
    })

    it('reset restores project elapsed to 0 and reverts store', async () => {
      const { project } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(5)
      expect(result.current.projectElapsed).toBe(5)
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(5)

      act(() => result.current.reset())
      expect(result.current.isRunning).toBe(false)
      // Reset restores to session baseline (0 for a fresh session)
      expect(result.current.projectElapsed).toBe(0)
      // Store totalTimeSeconds should be reverted to baseline
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(0)
      expect(localStorage.getItem('ff_active_session')).toBeNull()
    })

    it('reset restores sub-piece remaining to session baseline and reverts store', async () => {
      const { project, subPiece } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id))

      // Initial: 120 seconds remaining, projectElapsed starts at 0
      expect(result.current.subPieceRemaining).toBe(120)
      expect(result.current.projectElapsed).toBe(0)

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(10)

      expect(result.current.projectElapsed).toBe(10)
      expect(result.current.subPieceRemaining).toBe(110)
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(10)
      expect(useFocusStore.getState().getProjectById(project.id)?.subPieces[0].elapsedSeconds).toBe(10)

      act(() => result.current.reset())

      expect(result.current.isRunning).toBe(false)
      // Reset restores project elapsed to session baseline (0)
      expect(result.current.projectElapsed).toBe(0)
      // Reset restores sub-piece remaining to session baseline (120)
      expect(result.current.subPieceRemaining).toBe(120)
      // Store values should be reverted to baseline
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(0)
      expect(useFocusStore.getState().getProjectById(project.id)?.subPieces[0].elapsedSeconds).toBe(0)
      expect(localStorage.getItem('ff_active_session')).toBeNull()
    })

    it('reinitialize restores display to 0 without changing store values', async () => {
      const { project, subPiece } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(10)

      expect(result.current.projectElapsed).toBe(10)
      expect(result.current.subPieceRemaining).toBe(110)
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(10)
      expect(useFocusStore.getState().getProjectById(project.id)?.subPieces[0].elapsedSeconds).toBe(10)

      act(() => result.current.reinitialize())

      expect(result.current.isRunning).toBe(false)
      // Display should return to session baseline (0)
      expect(result.current.projectElapsed).toBe(0)
      expect(result.current.subPieceRemaining).toBe(120)
      // Store values should NOT be reverted (unlike reset)
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(10)
      expect(useFocusStore.getState().getProjectById(project.id)?.subPieces[0].elapsedSeconds).toBe(10)
      expect(localStorage.getItem('ff_active_session')).toBeNull()
    })

    it('resetToZero zeros elapsed display to 0 and restores sub-piece remaining to allocated time', async () => {
      const { project, subPiece } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id))

      // Initial state: projectElapsed starts at 0
      expect(result.current.projectElapsed).toBe(0)
      expect(result.current.subPieceRemaining).toBe(120)
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(0)
      expect(useFocusStore.getState().getProjectById(project.id)?.subPieces[0].elapsedSeconds).toBe(0)

      // Start and advance 10 seconds
      act(() => result.current.start())
      await flushRaf()
      await advanceTime(10)

      expect(result.current.projectElapsed).toBe(10)
      expect(result.current.subPieceRemaining).toBe(110)
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(10)
      expect(useFocusStore.getState().getProjectById(project.id)?.subPieces[0].elapsedSeconds).toBe(10)

      // resetToZero should zero out the elapsed display and restore remaining
      act(() => result.current.resetToZero())

      expect(result.current.isRunning).toBe(false)
      // projectElapsed display should be 0 (session baseline)
      expect(result.current.projectElapsed).toBe(0)
      // subPieceRemaining should return to allocated time (120)
      expect(result.current.subPieceRemaining).toBe(120)
      // Store values should be updated: totalTimeSeconds reduced, elapsedSeconds zeroed
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(0)
      expect(useFocusStore.getState().getProjectById(project.id)?.subPieces[0].elapsedSeconds).toBe(0)
      expect(localStorage.getItem('ff_active_session')).toBeNull()
    })

    it('stops and calls onComplete when project target is reached (project-only focus)', async () => {
      const project = useFocusStore.getState().addProject({
        name: 'Target Project',
        description: '',
        color: 'mint',
        targetTimeSeconds: 10,
      })

      const onComplete = vi.fn()
      const { result } = renderHook(() => useTimer(project.id, undefined, onComplete))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(12)

      expect(result.current.isRunning).toBe(false)
      expect(result.current.projectElapsed).toBe(10)
      expect(onComplete).toHaveBeenCalledTimes(1)

      // Project should be marked completed in store
      expect(useFocusStore.getState().getProjectById(project.id)?.status).toBe('completed')
      // localStorage should be cleared
      expect(localStorage.getItem('ff_active_session')).toBeNull()
    })

    it('stops at target even if sub-piece still has remaining time', async () => {
      const project = useFocusStore.getState().addProject({
        name: 'Target With Sub',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })
      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Long Task',
        allocatedMinutes: 2, // 120 seconds — more than the 10s target we'll set below
        order: 0,
      })

      // Directly lower target to 10 seconds so target is reached before sub-piece completes
      // (bypassing updateProject's floor-at-allocated logic)
      useFocusStore.setState((state) => ({
        projects: state.projects.map((p) =>
          p.id === project.id ? { ...p, targetTimeSeconds: 10 } : p
        ),
      }))

      const onComplete = vi.fn()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id, onComplete))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(12)

      expect(result.current.isRunning).toBe(false)
      expect(result.current.projectElapsed).toBe(10)
      expect(result.current.subPieceRemaining).toBe(110) // 120 - 10 = 110
      expect(onComplete).toHaveBeenCalledTimes(1)

      // Project should be completed, but sub-piece should NOT be completed
      const updatedProject = useFocusStore.getState().getProjectById(project.id)
      expect(updatedProject?.status).toBe('completed')
      expect(updatedProject?.subPieces[0].status).toBe('idle')
      expect(updatedProject?.subPieces[0].elapsedSeconds).toBe(10)
    })

    it('start() is no-op when project already at target', () => {
      const project = useFocusStore.getState().addProject({
        name: 'At Target',
        description: '',
        color: 'forest',
        targetTimeSeconds: 10,
      })

      // Pre-load project to target
      useFocusStore.getState().incrementProjectTime(project.id, 10)
      expect(useFocusStore.getState().getProjectById(project.id)?.totalTimeSeconds).toBe(10)

      const onComplete = vi.fn()
      const { result } = renderHook(() => useTimer(project.id, undefined, onComplete))

      expect(result.current.projectElapsed).toBe(10)

      act(() => result.current.start())
      expect(result.current.isRunning).toBe(false)
      expect(onComplete).not.toHaveBeenCalled()
    })

    it('start() is no-op when project already exceeds target (edge case)', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Over Target',
        description: '',
        color: 'coral',
        targetTimeSeconds: 10,
      })

      // Pre-load project past target (should not happen with capped increment, but defensive)
      // Manually set via updateProject
      useFocusStore.getState().updateProject(project.id, { totalTimeSeconds: 15 })

      const onComplete = vi.fn()
      const { result } = renderHook(() => useTimer(project.id, undefined, onComplete))

      act(() => result.current.start())
      expect(result.current.isRunning).toBe(false)
      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  describe('sub-piece countdown timer', () => {
    it('starts with correct remaining time', () => {
      const { project, subPiece } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id))

      // 2 minutes = 120 seconds
      expect(result.current.subPieceRemaining).toBe(120)
      expect(result.current.projectElapsed).toBe(0)
    })

    it('counts down sub-piece remaining while counting up project', async () => {
      const { project, subPiece } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(10)

      expect(result.current.projectElapsed).toBe(10)
      expect(result.current.subPieceRemaining).toBe(110)
    })

    it('auto-pauses and completes sub-piece when reaching zero', async () => {
      const { project, subPiece } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id))

      act(() => result.current.start())
      await flushRaf()
      // Advance exactly 120 seconds to deplete the sub-piece
      await advanceTime(120)

      expect(result.current.isRunning).toBe(false)
      expect(result.current.subPieceRemaining).toBe(0)
      expect(result.current.projectElapsed).toBe(120)

      // Verify store was updated
      const updatedProject = useFocusStore.getState().getProjectById(project.id)
      expect(updatedProject?.subPieces[0].status).toBe('completed')
      expect(updatedProject?.totalTimeSeconds).toBe(120)
      expect(updatedProject?.subPieces[0].elapsedSeconds).toBe(120)
    })

    it('calls onComplete callback when sub-piece reaches zero', async () => {
      const { project, subPiece } = createProjectWithSubPiece()
      const onComplete = vi.fn()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id, onComplete))

      act(() => result.current.start())
      await flushRaf()
      // Advance exactly 120 seconds to deplete the sub-piece
      await advanceTime(120)

      expect(result.current.isRunning).toBe(false)
      expect(result.current.subPieceRemaining).toBe(0)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('does not call onComplete when sub-piece was already at zero', () => {
      const { project, subPiece } = createProjectWithSubPiece()
      // Manually complete the sub-piece in store
      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)
      useFocusStore.getState().incrementSubPieceTime(project.id, subPiece.id, 120)

      const onComplete = vi.fn()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id, onComplete))

      // subPiece elapsed = 120, allocated = 120, so remaining = 0
      expect(result.current.subPieceRemaining).toBe(0)

      act(() => result.current.start())
      expect(result.current.isRunning).toBe(false)
      expect(onComplete).not.toHaveBeenCalled()
    })

    it('updates store incrementProjectTime and incrementSubPieceTime each second', async () => {
      const { project, subPiece } = createProjectWithSubPiece()
      const { result } = renderHook(() => useTimer(project.id, subPiece.id))

      act(() => result.current.start())
      await flushRaf()
      await advanceTime(3)

      const updatedProject = useFocusStore.getState().getProjectById(project.id)
      expect(updatedProject?.totalTimeSeconds).toBe(3)
      expect(updatedProject?.subPieces[0].elapsedSeconds).toBe(3)
    })
  })

  describe('session restoration with drift', () => {
    it('restores running session and applies drift', async () => {
      const { project, subPiece } = createProjectWithSubPiece()

      const savedSession = {
        projectId: project.id,
        subPieceId: subPiece.id,
        projectElapsed: 10,
        subPieceRemaining: 110,
        savedAt: 0,
        isRunning: true,
      }
      localStorage.setItem('ff_active_session', JSON.stringify(savedSession))
      now = 5000

      render(<TimerTestHarness projectId={project.id} subPieceId={subPiece.id} />)

      // State is restored synchronously on mount
      expect(screen.getByTestId('projectElapsed').textContent).toBe('15')
      expect(screen.getByTestId('subPieceRemaining').textContent).toBe('105')
      expect(screen.getByTestId('isRunning').textContent).toBe('true')

      // Flush the priming RAF and advance 1 second
      await flushRaf()
      await advanceTime(1)

      // projectElapsed was restored to 15, plus 1 second = 16
      // subPieceRemaining was restored to 105, minus 1 second = 104
      expect(screen.getByTestId('projectElapsed').textContent).toBe('16')
      expect(screen.getByTestId('subPieceRemaining').textContent).toBe('104')
      expect(screen.getByTestId('isRunning').textContent).toBe('true')
    })

    it('restores projectElapsed from saved session value, not store total', async () => {
      const { project, subPiece } = createProjectWithSubPiece()
      // Seed store with a large totalTimeSeconds
      useFocusStore.getState().incrementProjectTime(project.id, 500)

      const savedSession = {
        projectId: project.id,
        subPieceId: subPiece.id,
        projectElapsed: 25,
        subPieceRemaining: 95,
        savedAt: 0,
        isRunning: false,
      }
      localStorage.setItem('ff_active_session', JSON.stringify(savedSession))

      render(<TimerTestHarness projectId={project.id} subPieceId={subPiece.id} />)

      // projectElapsed should restore from session (25), not from store total (500)
      expect(screen.getByTestId('projectElapsed').textContent).toBe('25')
      expect(screen.getByTestId('subPieceRemaining').textContent).toBe('95')
      expect(screen.getByTestId('isRunning').textContent).toBe('false')
    })

    it('restores paused session without drift', async () => {
      const { project, subPiece } = createProjectWithSubPiece()

      const savedSession = {
        projectId: project.id,
        subPieceId: subPiece.id,
        projectElapsed: 20,
        subPieceRemaining: 100,
        savedAt: 0,
        isRunning: false,
      }
      localStorage.setItem('ff_active_session', JSON.stringify(savedSession))
      now = 10000

      render(<TimerTestHarness projectId={project.id} subPieceId={subPiece.id} />)

      // State is restored synchronously on mount
      expect(screen.getByTestId('projectElapsed').textContent).toBe('20')
      expect(screen.getByTestId('subPieceRemaining').textContent).toBe('100')
      expect(screen.getByTestId('isRunning').textContent).toBe('false')
      expect(rafCallbacks.size).toBe(0)

      // Start the timer — should begin from the restored elapsed time
      act(() => screen.getByTestId('start').click())
      await flushRaf()
      await advanceTime(1)

      expect(screen.getByTestId('projectElapsed').textContent).toBe('21')
      expect(screen.getByTestId('subPieceRemaining').textContent).toBe('99')
    })

    it('ignores session for different projectId', () => {
      const { project } = createProjectWithSubPiece()
      const otherProject = useFocusStore.getState().addProject({
        name: 'Other',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      const savedSession = {
        projectId: otherProject.id,
        subPieceId: undefined,
        projectElapsed: 50,
        subPieceRemaining: 0,
        savedAt: 0,
        isRunning: true,
      }
      localStorage.setItem('ff_active_session', JSON.stringify(savedSession))
      now = 10000

      render(<TimerTestHarness projectId={project.id} />)

      expect(screen.getByTestId('projectElapsed').textContent).toBe('0')
      expect(screen.getByTestId('isRunning').textContent).toBe('false')
    })

    it('auto-completes sub-piece on restore if drift brings it to zero', async () => {
      const { project, subPiece } = createProjectWithSubPiece()

      const savedSession = {
        projectId: project.id,
        subPieceId: subPiece.id,
        projectElapsed: 100,
        subPieceRemaining: 20,
        savedAt: 0,
        isRunning: true,
      }
      localStorage.setItem('ff_active_session', JSON.stringify(savedSession))
      now = 25000

      render(<TimerTestHarness projectId={project.id} subPieceId={subPiece.id} />)

      // State is restored synchronously on mount; drift auto-completes the sub-piece
      expect(screen.getByTestId('isRunning').textContent).toBe('false')
      expect(screen.getByTestId('subPieceRemaining').textContent).toBe('0')
      expect(screen.getByTestId('projectElapsed').textContent).toBe('120')

      const updatedProject = useFocusStore.getState().getProjectById(project.id)
      expect(updatedProject?.subPieces[0].status).toBe('completed')
    })

    it('caps drift at MAX_DRIFT_SECONDS and pauses timer when raw drift exceeds cap', async () => {
      // Use a project with high target so target-capping doesn't interfere with drift-capping test
      const project = useFocusStore.getState().addProject({
        name: 'Drift Cap Project',
        description: '',
        color: 'mint',
        targetTimeSeconds: 7200,
      })
      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 2,
        order: 0,
      })

      // Session saved 2 hours ago (7200 seconds), running, with 100s remaining
      const savedSession = {
        projectId: project.id,
        subPieceId: subPiece.id,
        projectElapsed: 20,
        subPieceRemaining: 100,
        savedAt: 0,
        isRunning: true,
      }
      localStorage.setItem('ff_active_session', JSON.stringify(savedSession))
      // 2 hours later
      now = 7200 * 1000

      render(<TimerTestHarness projectId={project.id} subPieceId={subPiece.id} />)

      // Drift is capped at 3600 seconds (60 minutes)
      // projectElapsed = 20 + 3600 = 3620
      // subPieceRemaining = max(0, 100 - 3600) = 0
      // But since drift was capped, isRunning should be false and no auto-complete
      expect(screen.getByTestId('isRunning').textContent).toBe('false')
      expect(screen.getByTestId('projectElapsed').textContent).toBe('3620')
      expect(screen.getByTestId('subPieceRemaining').textContent).toBe('0')

      // Sub-piece should NOT be auto-completed because drift was capped
      const updatedProject = useFocusStore.getState().getProjectById(project.id)
      expect(updatedProject?.subPieces[0].status).toBe('idle')
    })

    it('ignores corrupt localStorage data', () => {
      localStorage.setItem('ff_active_session', 'not-json{{')

      const { project } = createProjectWithSubPiece()
      render(<TimerTestHarness projectId={project.id} />)

      expect(screen.getByTestId('projectElapsed').textContent).toBe('0')
      expect(screen.getByTestId('isRunning').textContent).toBe('false')
    })
  })

  describe('cleanup', () => {
    it('cancels RAF on unmount', () => {
      const { project } = createProjectWithSubPiece()
      const { result, unmount } = renderHook(() => useTimer(project.id))

      act(() => result.current.start())
      expect(rafCallbacks.size).toBeGreaterThan(0)

      act(() => unmount())
      expect(rafCallbacks.size).toBe(0)
    })
  })

  describe('undefined projectId (neutral / safe mode)', () => {
    it('returns neutral values and no-op handlers when projectId is undefined', () => {
      const { result } = renderHook(() => useTimer(undefined, undefined))

      expect(result.current.isRunning).toBe(false)
      expect(result.current.projectElapsed).toBe(0)
      expect(result.current.subPieceRemaining).toBe(0)

      // No-op handlers should not throw
      act(() => result.current.start())
      act(() => result.current.pause())
      act(() => result.current.reset())

      expect(result.current.isRunning).toBe(false)
      expect(result.current.projectElapsed).toBe(0)
      expect(result.current.subPieceRemaining).toBe(0)
    })
  })
})
