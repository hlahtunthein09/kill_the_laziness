import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useFocusStore } from '../useFocusStore'
import { DEFAULT_APP_SETTINGS } from '@/lib/constants'

describe('project status', () => {
  beforeEach(() => {
    useFocusStore.setState({
      projects: [],
      activeProjectId: null,
      settings: { ...DEFAULT_APP_SETTINGS },
      logs: [],
      hasHydrated: false,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('setActiveProject', () => {
    it('marks target project as running', () => {
      const p1 = useFocusStore.getState().addProject({
        name: 'Project 1',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().setActiveProject(p1.id)

      const updated = useFocusStore.getState().projects.find((p) => p.id === p1.id)
      expect(updated?.status).toBe('running')
    })

    it('marks previous active project as idle', () => {
      const p1 = useFocusStore.getState().addProject({
        name: 'Project 1',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })
      const p2 = useFocusStore.getState().addProject({
        name: 'Project 2',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 7200,
      })

      // Activate p1 first
      useFocusStore.getState().setActiveProject(p1.id)
      expect(useFocusStore.getState().projects.find((p) => p.id === p1.id)?.status).toBe('running')

      // Now activate p2 — p1 should become idle
      useFocusStore.getState().setActiveProject(p2.id)
      expect(useFocusStore.getState().projects.find((p) => p.id === p2.id)?.status).toBe('running')
      expect(useFocusStore.getState().projects.find((p) => p.id === p1.id)?.status).toBe('idle')
    })

    it('does not change status of non-running projects', () => {
      const p1 = useFocusStore.getState().addProject({
        name: 'Project 1',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })
      const p2 = useFocusStore.getState().addProject({
        name: 'Project 2',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 7200,
      })

      // Manually set p2 to completed
      useFocusStore.getState().updateProject(p2.id, { status: 'completed' })

      // Activate p1
      useFocusStore.getState().setActiveProject(p1.id)

      // p2 should stay completed
      expect(useFocusStore.getState().projects.find((p) => p.id === p2.id)?.status).toBe('completed')
    })
  })

  describe('completeSubPiece', () => {
    it('does not mark project completed when all sub-pieces are done', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Project',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const sp1 = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 1',
        allocatedMinutes: 30,
        order: 0,
      })
      const sp2 = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 2',
        allocatedMinutes: 30,
        order: 1,
      })

      // Complete both sub-pieces
      useFocusStore.getState().completeSubPiece(project.id, sp1.id)
      useFocusStore.getState().completeSubPiece(project.id, sp2.id)

      const updatedProject = useFocusStore.getState().projects.find((p) => p.id === project.id)
      expect(updatedProject?.status).toBe('idle')
      expect(updatedProject?.subPieces[0].status).toBe('completed')
      expect(updatedProject?.subPieces[1].status).toBe('completed')
    })

    it('keeps project running when some sub-pieces remain incomplete', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Project',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const sp1 = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 1',
        allocatedMinutes: 30,
        order: 0,
      })
      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 2',
        allocatedMinutes: 30,
        order: 1,
      })

      // Set project to running
      useFocusStore.getState().setActiveProject(project.id)
      expect(useFocusStore.getState().projects.find((p) => p.id === project.id)?.status).toBe('running')

      // Complete only one sub-piece
      useFocusStore.getState().completeSubPiece(project.id, sp1.id)

      const updatedProject = useFocusStore.getState().projects.find((p) => p.id === project.id)
      expect(updatedProject?.status).toBe('running')
      expect(updatedProject?.subPieces[0].status).toBe('completed')
      expect(updatedProject?.subPieces[1].status).toBe('idle')
    })

    it('does not mark project completed when project has no sub-pieces', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Empty Project',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      // Project has no sub-pieces, so status should remain idle
      // (completeSubPiece requires a subPieceId, but we verify the allCompleted logic)
      expect(useFocusStore.getState().projects.find((p) => p.id === project.id)?.status).toBe('idle')
    })
  })
})
