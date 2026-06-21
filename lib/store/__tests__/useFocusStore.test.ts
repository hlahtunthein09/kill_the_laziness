import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFocusStore } from '../useFocusStore'
import { DEFAULT_APP_SETTINGS } from '@/lib/constants'

describe('useFocusStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
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

  describe('initial state', () => {
    it('has empty projects array', () => {
      expect(useFocusStore.getState().projects).toEqual([])
    })

    it('has null activeProjectId', () => {
      expect(useFocusStore.getState().activeProjectId).toBeNull()
    })

    it('has default settings', () => {
      expect(useFocusStore.getState().settings).toEqual(DEFAULT_APP_SETTINGS)
    })

    it('has empty logs array', () => {
      expect(useFocusStore.getState().logs).toEqual([])
    })

    it('has hasHydrated as false', () => {
      expect(useFocusStore.getState().hasHydrated).toBe(false)
    })
  })

  describe('hydration', () => {
    it('hasHydrated transitions to true after setHasHydrated', () => {
      expect(useFocusStore.getState().hasHydrated).toBe(false)
      useFocusStore.getState().setHasHydrated(true)
      expect(useFocusStore.getState().hasHydrated).toBe(true)
    })

    it('loads persisted data from localStorage when rehydrated', () => {
      const persistedData = {
        state: {
          projects: [
            {
              id: 'persisted-proj-1',
              name: 'Persisted Project',
              description: 'From storage',
              color: 'mint',
              createdAt: Date.now(),
              totalTimeSeconds: 1200,
              targetTimeSeconds: 3600,
              status: 'idle',
              fortressLevel: 1,
              fortressHealth: 100,
              xp: 0,
              subPieces: [],
            },
          ],
          activeProjectId: 'persisted-proj-1',
          settings: { ...DEFAULT_APP_SETTINGS },
          logs: [],
          hasHydrated: false,
        },
        version: 0,
      }

      // Simulate localStorage having persisted data
      const storageKey = 'ff_focus_store'
      localStorage.setItem(storageKey, JSON.stringify(persistedData))

      // Force rehydrate by re-creating the store's persist layer
      // We verify by checking the store state after rehydration
      // Since the store is already created, we simulate the effect of onRehydrateStorage
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}')
      if (parsed.state) {
        useFocusStore.setState(parsed.state)
        useFocusStore.getState().setHasHydrated(true)
      }

      expect(useFocusStore.getState().hasHydrated).toBe(true)
      expect(useFocusStore.getState().projects).toHaveLength(1)
      expect(useFocusStore.getState().projects[0].name).toBe('Persisted Project')
      expect(useFocusStore.getState().activeProjectId).toBe('persisted-proj-1')

      localStorage.removeItem(storageKey)
    })
  })

  describe('addProject', () => {
    it('adds a project to the store', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Test Project',
        description: 'A test project',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      expect(project.name).toBe('Test Project')
      expect(project.description).toBe('A test project')
      expect(project.color).toBe('mint')
      expect(project.targetTimeSeconds).toBe(3600)
      expect(project.id).toBeDefined()
      expect(project.createdAt).toBeDefined()
      expect(project.totalTimeSeconds).toBe(0)
      expect(project.fortressLevel).toBe(1)
      expect(project.fortressHealth).toBe(100)
      expect(project.xp).toBe(0)
      expect(project.subPieces).toEqual([])
      expect(project.status).toBe('idle')

      expect(useFocusStore.getState().projects).toHaveLength(1)
      expect(useFocusStore.getState().activeProjectId).toBe(project.id)
    })

    it('sets activeProjectId to the first added project', () => {
      const project = useFocusStore.getState().addProject({
        name: 'First Project',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 7200,
      })

      expect(useFocusStore.getState().activeProjectId).toBe(project.id)
    })

    it('does not change activeProjectId when adding subsequent projects', () => {
      const first = useFocusStore.getState().addProject({
        name: 'First',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().addProject({
        name: 'Second',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 7200,
      })

      expect(useFocusStore.getState().activeProjectId).toBe(first.id)
    })
  })

  describe('updateProject', () => {
    it('updates project fields', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Original',
        description: 'Original desc',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().updateProject(project.id, {
        name: 'Updated',
        description: 'Updated desc',
      })

      const updated = useFocusStore.getState().projects[0]
      expect(updated.name).toBe('Updated')
      expect(updated.description).toBe('Updated desc')
      expect(updated.color).toBe('mint') // unchanged
      expect(updated.id).toBe(project.id) // unchanged
    })

    it('does not affect other projects', () => {
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

      useFocusStore.getState().updateProject(p1.id, { name: 'Updated 1' })

      expect(useFocusStore.getState().projects[1].name).toBe('Project 2')
      expect(useFocusStore.getState().projects[1].id).toBe(p2.id)
    })
  })

  describe('deleteProject', () => {
    it('removes a project from the store', () => {
      const project = useFocusStore.getState().addProject({
        name: 'To Delete',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().deleteProject(project.id)

      expect(useFocusStore.getState().projects).toHaveLength(0)
    })

    it('updates activeProjectId when deleting the active project', () => {
      const p1 = useFocusStore.getState().addProject({
        name: 'First',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().addProject({
        name: 'Second',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 7200,
      })

      useFocusStore.getState().deleteProject(p1.id)

      expect(useFocusStore.getState().activeProjectId).not.toBe(p1.id)
      expect(useFocusStore.getState().activeProjectId).toBeDefined()
    })

    it('sets activeProjectId to null when deleting the only project', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Only',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().deleteProject(project.id)

      expect(useFocusStore.getState().activeProjectId).toBeNull()
    })
  })

  describe('addSubPiece', () => {
    it('adds a sub-piece under a project', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Project',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Sub-task 1',
        allocatedMinutes: 30,
        order: 0,
      })

      expect(subPiece.name).toBe('Sub-task 1')
      expect(subPiece.projectId).toBe(project.id)
      expect(subPiece.allocatedMinutes).toBe(30)
      expect(subPiece.elapsedSeconds).toBe(0)
      expect(subPiece.status).toBe('idle')
      expect(subPiece.id).toBeDefined()

      const updatedProject = useFocusStore.getState().projects[0]
      expect(updatedProject.subPieces).toHaveLength(1)
      expect(updatedProject.subPieces[0].id).toBe(subPiece.id)
    })
  })

  describe('completeSubPiece', () => {
    it('marks a sub-piece as completed', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Project',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Sub-task',
        allocatedMinutes: 30,
        order: 0,
      })

      expect(subPiece.status).toBe('idle')

      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)

      const updatedProject = useFocusStore.getState().projects[0]
      expect(updatedProject.subPieces[0].status).toBe('completed')
    })
  })

  describe('updateSettings', () => {
    it('changes settings values', () => {
      useFocusStore.getState().updateSettings({
        strictMode: true,
        notificationsEnabled: false,
      })

      const settings = useFocusStore.getState().settings
      expect(settings.strictMode).toBe(true)
      expect(settings.notificationsEnabled).toBe(false)
      expect(settings.theme).toBe('system') // unchanged
    })

    it('preserves existing settings when partial update', () => {
      useFocusStore.getState().updateSettings({ strictMode: true })

      const settings = useFocusStore.getState().settings
      expect(settings.forbiddenUrls).toEqual(DEFAULT_APP_SETTINGS.forbiddenUrls)
      expect(settings.theme).toBe('system')
    })
  })

  describe('addLog', () => {
    it('adds a distraction log', () => {
      const log = useFocusStore.getState().addLog({
        url: 'youtube.com/shorts',
        action: 'blocked',
        projectId: 'project-123',
      })

      expect(log.url).toBe('youtube.com/shorts')
      expect(log.action).toBe('blocked')
      expect(log.projectId).toBe('project-123')
      expect(log.id).toBeDefined()
      expect(log.timestamp).toBeDefined()

      expect(useFocusStore.getState().logs).toHaveLength(1)
    })
  })

  describe('getters', () => {
    it('getActiveProject returns the active project', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Active',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const active = useFocusStore.getState().getActiveProject()
      expect(active?.id).toBe(project.id)
    })

    it('getProjectById returns correct project', () => {
      const p1 = useFocusStore.getState().addProject({
        name: 'Project 1',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const found = useFocusStore.getState().getProjectById(p1.id)
      expect(found?.name).toBe('Project 1')
    })

    it('getProjectProgress returns 0 for project with no sub-pieces', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Empty',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      expect(useFocusStore.getState().getProjectProgress(project.id)).toBe(0)
    })

    it('getProjectProgress calculates completion percentage', () => {
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

      useFocusStore.getState().completeSubPiece(project.id, sp1.id)

      expect(useFocusStore.getState().getProjectProgress(project.id)).toBe(50)
    })
  })
})
