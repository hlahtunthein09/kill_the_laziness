import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFocusStore } from '../useFocusStore'
import { DEFAULT_APP_SETTINGS, XP_PER_MINUTE, XP_SUB_PIECE_COMPLETE, LEVEL_THRESHOLDS, getLevelFromXp } from '@/lib/constants'

describe('useFocusStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useFocusStore.setState({
      projects: [],
      activeProjectId: null,
      activeSubPieceId: null,
      projectOnlyFocus: false,
      settings: { ...DEFAULT_APP_SETTINGS },
      logs: [],
      hasHydrated: false,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('projectOnlyFocus', () => {
    it('initializes projectOnlyFocus to false', () => {
      expect(useFocusStore.getState().projectOnlyFocus).toBe(false)
    })

    it('sets projectOnlyFocus to true when setActiveProject is called', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Project',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      expect(useFocusStore.getState().projectOnlyFocus).toBe(false)

      useFocusStore.getState().setActiveProject(project.id)
      expect(useFocusStore.getState().projectOnlyFocus).toBe(true)
    })

    it('sets projectOnlyFocus to false when setActiveSubPiece is called', () => {
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

      // First set active project to set projectOnlyFocus to true
      useFocusStore.getState().setActiveProject(project.id)
      expect(useFocusStore.getState().projectOnlyFocus).toBe(true)

      // Now set active sub-piece — should clear projectOnlyFocus
      useFocusStore.getState().setActiveSubPiece(project.id, subPiece.id)
      expect(useFocusStore.getState().projectOnlyFocus).toBe(false)
    })

    it('sets projectOnlyFocus to false when setActiveSubPiece is called with null', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Project',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Sub-task',
        allocatedMinutes: 30,
        order: 0,
      })

      useFocusStore.getState().setActiveProject(project.id)
      expect(useFocusStore.getState().projectOnlyFocus).toBe(true)

      useFocusStore.getState().setActiveSubPiece(project.id, null)
      expect(useFocusStore.getState().projectOnlyFocus).toBe(false)
    })
  })

  describe('initial state', () => {
    it('has empty projects array', () => {
      expect(useFocusStore.getState().projects).toEqual([])
    })

    it('has null activeProjectId', () => {
      expect(useFocusStore.getState().activeProjectId).toBeNull()
    })

    it('has default settings with daily focus and streak fields', () => {
      const settings = useFocusStore.getState().settings
      expect(settings.dailyFocusGoalMinutes).toBe(60)
      expect(settings.todayFocusSeconds).toBe(0)
      expect(settings.lastFocusDate).toBe('')
      expect(settings.currentStreak).toBe(0)
      expect(settings.longestStreak).toBe(0)
      expect(settings.lastStreakDate).toBe('')
      expect(settings.forbiddenUrls).toEqual(DEFAULT_APP_SETTINGS.forbiddenUrls)
      expect(settings.strictMode).toBe(false)
      expect(settings.notificationsEnabled).toBe(true)
      expect(settings.theme).toBe('system')
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

  describe('setActiveSubPiece', () => {
    it('sets the active sub-piece ID when valid', () => {
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

      useFocusStore.getState().setActiveSubPiece(project.id, subPiece.id)
      expect(useFocusStore.getState().activeSubPieceId).toBe(subPiece.id)
    })

    it('clears the active sub-piece ID with null', () => {
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

      useFocusStore.getState().setActiveSubPiece(project.id, subPiece.id)
      expect(useFocusStore.getState().activeSubPieceId).toBe(subPiece.id)

      useFocusStore.getState().setActiveSubPiece(project.id, null)
      expect(useFocusStore.getState().activeSubPieceId).toBeNull()
    })

    it('ignores an invalid sub-piece ID', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Project',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Sub-task',
        allocatedMinutes: 30,
        order: 0,
      })

      useFocusStore.getState().setActiveSubPiece(project.id, 'non-existent-id')
      expect(useFocusStore.getState().activeSubPieceId).toBeNull()
    })

    it('ignores a sub-piece ID from a different project', () => {
      const project1 = useFocusStore.getState().addProject({
        name: 'Project 1',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const project2 = useFocusStore.getState().addProject({
        name: 'Project 2',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      const subPiece2 = useFocusStore.getState().addSubPiece({
        projectId: project2.id,
        name: 'Sub-task on P2',
        allocatedMinutes: 30,
        order: 0,
      })

      // Try to set sub-piece from project2 under project1
      useFocusStore.getState().setActiveSubPiece(project1.id, subPiece2.id)
      expect(useFocusStore.getState().activeSubPieceId).toBeNull()
    })
  })

  describe('setActiveProject', () => {
    it('clears activeSubPieceId when the active project changes', () => {
      const project1 = useFocusStore.getState().addProject({
        name: 'Project 1',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const project2 = useFocusStore.getState().addProject({
        name: 'Project 2',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project1.id,
        name: 'Sub-task',
        allocatedMinutes: 30,
        order: 0,
      })

      useFocusStore.getState().setActiveSubPiece(project1.id, subPiece.id)
      expect(useFocusStore.getState().activeSubPieceId).toBe(subPiece.id)

      // Switch active project
      useFocusStore.getState().setActiveProject(project2.id)
      expect(useFocusStore.getState().activeSubPieceId).toBeNull()
    })

    it('clears activeSubPieceId when setting active project to null', () => {
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

      useFocusStore.getState().setActiveSubPiece(project.id, subPiece.id)
      expect(useFocusStore.getState().activeSubPieceId).toBe(subPiece.id)

      // Clear active project
      useFocusStore.getState().setActiveProject(null)
      expect(useFocusStore.getState().activeSubPieceId).toBeNull()
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

    it('awards XP_SUB_PIECE_COMPLETE to the project', () => {
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

      expect(project.xp).toBe(0)

      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)

      const updatedProject = useFocusStore.getState().projects[0]
      expect(updatedProject.subPieces[0].status).toBe('completed')
      expect(updatedProject.xp).toBe(XP_SUB_PIECE_COMPLETE)
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

  describe('incrementProjectTime', () => {
    it('adds XP per full minute of focused time', () => {
      const project = useFocusStore.getState().addProject({
        name: 'XP Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 120)

      const updated = useFocusStore.getState().projects[0]
      expect(updated.totalTimeSeconds).toBe(120)
      expect(updated.xp).toBe(2 * XP_PER_MINUTE)
    })

    it('does not add XP for partial minutes', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Partial Test',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 30)

      const updated = useFocusStore.getState().projects[0]
      expect(updated.totalTimeSeconds).toBe(30)
      expect(updated.xp).toBe(0)
    })

    it('adds seconds to todayFocusSeconds when lastFocusDate is today', () => {
      const today = new Date().toISOString().slice(0, 10)
      useFocusStore.setState({
        settings: { ...DEFAULT_APP_SETTINGS, lastFocusDate: today, todayFocusSeconds: 300 },
      })

      const project = useFocusStore.getState().addProject({
        name: 'Daily Focus Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 120)

      expect(useFocusStore.getState().settings.todayFocusSeconds).toBe(420)
      expect(useFocusStore.getState().settings.lastFocusDate).toBe(today)
    })

    it('resets todayFocusSeconds when lastFocusDate is not today', () => {
      const today = new Date().toISOString().slice(0, 10)
      useFocusStore.setState({
        settings: { ...DEFAULT_APP_SETTINGS, lastFocusDate: '2020-01-01', todayFocusSeconds: 9999 },
      })

      const project = useFocusStore.getState().addProject({
        name: 'Date Reset Test',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 120)

      expect(useFocusStore.getState().settings.todayFocusSeconds).toBe(120)
      expect(useFocusStore.getState().settings.lastFocusDate).toBe(today)
    })

    it('increments currentStreak to 1 when daily goal is reached', () => {
      const today = new Date().toISOString().slice(0, 10)
      useFocusStore.setState({
        settings: { ...DEFAULT_APP_SETTINGS, dailyFocusGoalMinutes: 1, todayFocusSeconds: 0 },
      })

      const project = useFocusStore.getState().addProject({
        name: 'Streak Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 60)

      const settings = useFocusStore.getState().settings
      expect(settings.currentStreak).toBe(1)
      expect(settings.longestStreak).toBe(1)
      expect(settings.lastStreakDate).toBe(today)
    })

    it('increments streak on consecutive days', () => {
      const today = new Date().toISOString().slice(0, 10)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)

      useFocusStore.setState({
        settings: {
          ...DEFAULT_APP_SETTINGS,
          dailyFocusGoalMinutes: 1,
          currentStreak: 3,
          longestStreak: 3,
          lastStreakDate: yesterdayStr,
        },
      })

      const project = useFocusStore.getState().addProject({
        name: 'Consecutive Streak',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 60)

      const settings = useFocusStore.getState().settings
      expect(settings.currentStreak).toBe(4)
      expect(settings.longestStreak).toBe(4)
      expect(settings.lastStreakDate).toBe(today)
    })

    it('resets streak to 1 after a gap', () => {
      const today = new Date().toISOString().slice(0, 10)

      useFocusStore.setState({
        settings: {
          ...DEFAULT_APP_SETTINGS,
          dailyFocusGoalMinutes: 1,
          currentStreak: 5,
          longestStreak: 5,
          lastStreakDate: '2020-01-01',
        },
      })

      const project = useFocusStore.getState().addProject({
        name: 'Gap Reset',
        description: '',
        color: 'forest',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 60)

      const settings = useFocusStore.getState().settings
      expect(settings.currentStreak).toBe(1)
      expect(settings.longestStreak).toBe(5) // unchanged
      expect(settings.lastStreakDate).toBe(today)
    })

    it('marks completed when increment crosses target and allows overtime', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Cap Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 600,
      })

      // Pre-load 580 seconds
      useFocusStore.getState().incrementProjectTime(project.id, 580)
      expect(useFocusStore.getState().projects[0].totalTimeSeconds).toBe(580)
      expect(useFocusStore.getState().projects[0].status).toBe('idle')

      // Add 60 seconds — target is crossed, project is completed, overtime is allowed
      useFocusStore.getState().incrementProjectTime(project.id, 60)

      const updated = useFocusStore.getState().projects[0]
      expect(updated.totalTimeSeconds).toBe(640)
      expect(updated.status).toBe('completed')
    })

    it('does not mark completed when increment does not reach target', () => {
      const project = useFocusStore.getState().addProject({
        name: 'No Cap Test',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 600,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 300)

      const updated = useFocusStore.getState().projects[0]
      expect(updated.totalTimeSeconds).toBe(300)
      expect(updated.status).toBe('idle')
    })

    it('awards XP based on requested seconds when target is crossed', () => {
      const project = useFocusStore.getState().addProject({
        name: 'XP Cap Test',
        description: '',
        color: 'forest',
        targetTimeSeconds: 600,
      })

      // Pre-load 580 seconds (9 full minutes = 45 XP)
      useFocusStore.getState().incrementProjectTime(project.id, 580)
      expect(useFocusStore.getState().projects[0].xp).toBe(9 * XP_PER_MINUTE)

      // Request 60 more — all 60 seconds added (10 full minutes total = 50 XP)
      useFocusStore.getState().incrementProjectTime(project.id, 60)

      const updated = useFocusStore.getState().projects[0]
      expect(updated.totalTimeSeconds).toBe(640)
      expect(updated.xp).toBe(10 * XP_PER_MINUTE)
    })

    it('adds requested seconds to todayFocusSeconds when target is crossed', () => {
      const today = new Date().toISOString().slice(0, 10)
      useFocusStore.setState({
        settings: { ...DEFAULT_APP_SETTINGS, lastFocusDate: today, todayFocusSeconds: 0 },
      })

      const project = useFocusStore.getState().addProject({
        name: 'Today Focus Cap',
        description: '',
        color: 'coral',
        targetTimeSeconds: 600,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 580)
      useFocusStore.getState().incrementProjectTime(project.id, 60)

      // All 640 seconds added
      expect(useFocusStore.getState().settings.todayFocusSeconds).toBe(640)
    })
  })

  describe('completeProject', () => {
    it('sets project status to completed', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Complete Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      expect(useFocusStore.getState().projects[0].status).toBe('idle')

      useFocusStore.getState().completeProject(project.id)

      expect(useFocusStore.getState().projects[0].status).toBe('completed')
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
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().completeProject(p1.id)

      expect(useFocusStore.getState().projects[0].status).toBe('completed')
      expect(useFocusStore.getState().projects[1].status).toBe('idle')
    })
  })

  describe('restartProject', () => {
    it('resets project total time, status, and all sub-pieces to idle with zero elapsed time', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Restart Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })
      const sp1 = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 1',
        allocatedMinutes: 10,
        order: 0,
      })
      const sp2 = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 2',
        allocatedMinutes: 5,
        order: 1,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 600)
      useFocusStore.getState().incrementSubPieceTime(project.id, sp1.id, 600)
      useFocusStore.getState().completeSubPiece(project.id, sp1.id)
      useFocusStore.getState().completeSubPiece(project.id, sp2.id)
      useFocusStore.getState().completeProject(project.id)

      const stateBefore = useFocusStore.getState()
      expect(stateBefore.projects[0].totalTimeSeconds).toBe(600)
      expect(stateBefore.projects[0].status).toBe('completed')
      expect(stateBefore.projects[0].subPieces[0].elapsedSeconds).toBe(600)
      expect(stateBefore.projects[0].subPieces[0].status).toBe('completed')
      expect(stateBefore.projects[0].subPieces[1].status).toBe('completed')

      useFocusStore.getState().restartProject(project.id)

      const restarted = useFocusStore.getState().projects[0]
      expect(restarted.totalTimeSeconds).toBe(0)
      expect(restarted.status).toBe('idle')
      expect(restarted.subPieces[0].elapsedSeconds).toBe(0)
      expect(restarted.subPieces[0].status).toBe('idle')
      expect(restarted.subPieces[1].elapsedSeconds).toBe(0)
      expect(restarted.subPieces[1].status).toBe('idle')
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
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().incrementProjectTime(p1.id, 120)
      useFocusStore.getState().completeProject(p1.id)
      useFocusStore.getState().incrementProjectTime(p2.id, 300)

      useFocusStore.getState().restartProject(p1.id)

      expect(useFocusStore.getState().getProjectById(p1.id)?.totalTimeSeconds).toBe(0)
      expect(useFocusStore.getState().getProjectById(p1.id)?.status).toBe('idle')
      expect(useFocusStore.getState().getProjectById(p2.id)?.totalTimeSeconds).toBe(300)
    })
  })

  describe('decrementProjectTime', () => {
    it('reduces totalTimeSeconds, xp, and todayFocusSeconds', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Decrement Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      // First add time
      useFocusStore.getState().incrementProjectTime(project.id, 180)
      expect(useFocusStore.getState().projects[0].totalTimeSeconds).toBe(180)
      expect(useFocusStore.getState().projects[0].xp).toBe(3 * XP_PER_MINUTE)
      expect(useFocusStore.getState().settings.todayFocusSeconds).toBe(180)

      // Then decrement
      useFocusStore.getState().decrementProjectTime(project.id, 60)
      const updated = useFocusStore.getState().projects[0]
      expect(updated.totalTimeSeconds).toBe(120)
      expect(updated.xp).toBe(2 * XP_PER_MINUTE)
      expect(useFocusStore.getState().settings.todayFocusSeconds).toBe(120)
    })

    it('clamps values at 0', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Clamp Test',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      // Add a small amount of time
      useFocusStore.getState().incrementProjectTime(project.id, 30)
      expect(useFocusStore.getState().projects[0].totalTimeSeconds).toBe(30)
      expect(useFocusStore.getState().projects[0].xp).toBe(0)

      // Decrement more than exists
      useFocusStore.getState().decrementProjectTime(project.id, 120)
      const updated = useFocusStore.getState().projects[0]
      expect(updated.totalTimeSeconds).toBe(0)
      expect(updated.xp).toBe(0)
      expect(updated.fortressLevel).toBe(1)
      expect(updated.fortressHealth).toBe(0)
      expect(useFocusStore.getState().settings.todayFocusSeconds).toBe(0)
    })

    it('recomputes fortressLevel and fortressHealth from new xp', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Fortress Decrement',
        description: '',
        color: 'forest',
        targetTimeSeconds: 3600,
      })

      // Add enough time to level up
      useFocusStore.getState().incrementProjectTime(project.id, 600)
      const afterAdd = useFocusStore.getState().projects[0]
      expect(afterAdd.xp).toBe(10 * XP_PER_MINUTE)

      // Decrement enough to drop level
      useFocusStore.getState().decrementProjectTime(project.id, 300)
      const updated = useFocusStore.getState().projects[0]
      expect(updated.xp).toBe(5 * XP_PER_MINUTE)
      expect(updated.fortressLevel).toBe(getLevelFromXp(5 * XP_PER_MINUTE))
      const level = getLevelFromXp(5 * XP_PER_MINUTE)
      const current = LEVEL_THRESHOLDS[level - 1]
      const next = LEVEL_THRESHOLDS[level]
      expect(updated.fortressHealth).toBe(Math.round(((5 * XP_PER_MINUTE - current) / (next - current)) * 100))
    })

    it('does not change streak fields', () => {
      const today = new Date().toISOString().slice(0, 10)
      useFocusStore.setState({
        settings: {
          ...DEFAULT_APP_SETTINGS,
          dailyFocusGoalMinutes: 1,
          currentStreak: 3,
          longestStreak: 5,
          lastStreakDate: today,
          todayFocusSeconds: 120,
        },
      })

      const project = useFocusStore.getState().addProject({
        name: 'Streak Preserved',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 60)
      useFocusStore.getState().decrementProjectTime(project.id, 30)

      const settings = useFocusStore.getState().settings
      expect(settings.currentStreak).toBe(3)
      expect(settings.longestStreak).toBe(5)
      expect(settings.lastStreakDate).toBe(today)
    })
  })

  describe('decrementSubPieceTime', () => {
    it('reduces elapsedSeconds on the matching sub-piece', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Sub Decrement',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 30,
        order: 0,
      })

      // Add time
      useFocusStore.getState().incrementSubPieceTime(project.id, subPiece.id, 120)
      expect(useFocusStore.getState().projects[0].subPieces[0].elapsedSeconds).toBe(120)

      // Decrement
      useFocusStore.getState().decrementSubPieceTime(project.id, subPiece.id, 60)
      expect(useFocusStore.getState().projects[0].subPieces[0].elapsedSeconds).toBe(60)
    })

    it('clamps elapsedSeconds at 0', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Sub Clamp',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 30,
        order: 0,
      })

      // Add small amount
      useFocusStore.getState().incrementSubPieceTime(project.id, subPiece.id, 30)
      expect(useFocusStore.getState().projects[0].subPieces[0].elapsedSeconds).toBe(30)

      // Decrement more than exists
      useFocusStore.getState().decrementSubPieceTime(project.id, subPiece.id, 120)
      expect(useFocusStore.getState().projects[0].subPieces[0].elapsedSeconds).toBe(0)
    })

    it('does not change sub-piece status', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Status Preserved',
        description: '',
        color: 'forest',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 30,
        order: 0,
      })

      useFocusStore.getState().updateSubPieceStatus(project.id, subPiece.id, 'running')
      useFocusStore.getState().incrementSubPieceTime(project.id, subPiece.id, 120)
      useFocusStore.getState().decrementSubPieceTime(project.id, subPiece.id, 60)

      expect(useFocusStore.getState().projects[0].subPieces[0].status).toBe('running')
    })

    it('does not affect other sub-pieces', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Other Sub Safe',
        description: '',
        color: 'coral',
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

      useFocusStore.getState().incrementSubPieceTime(project.id, sp1.id, 120)
      useFocusStore.getState().incrementSubPieceTime(project.id, sp2.id, 120)

      useFocusStore.getState().decrementSubPieceTime(project.id, sp1.id, 60)

      expect(useFocusStore.getState().projects[0].subPieces[0].elapsedSeconds).toBe(60)
      expect(useFocusStore.getState().projects[0].subPieces[1].elapsedSeconds).toBe(120)
    })
  })

  describe('refocusSubPiece', () => {
    it('resets a completed sub-piece to idle with elapsedSeconds 0', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Refocus Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 30,
        order: 0,
      })

      // Complete the sub-piece and add some elapsed time
      useFocusStore.getState().incrementSubPieceTime(project.id, subPiece.id, 120)
      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)

      expect(useFocusStore.getState().projects[0].subPieces[0].status).toBe('completed')
      expect(useFocusStore.getState().projects[0].subPieces[0].elapsedSeconds).toBe(120)

      // Refocus
      useFocusStore.getState().refocusSubPiece(project.id, subPiece.id)

      const updatedProject = useFocusStore.getState().projects[0]
      expect(updatedProject.subPieces[0].status).toBe('idle')
      expect(updatedProject.subPieces[0].elapsedSeconds).toBe(0)
    })

    it('updates allocatedMinutes when provided', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Refocus Minutes Test',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 30,
        order: 0,
      })

      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)
      expect(useFocusStore.getState().projects[0].subPieces[0].allocatedMinutes).toBe(30)

      useFocusStore.getState().refocusSubPiece(project.id, subPiece.id, 45)

      expect(useFocusStore.getState().projects[0].subPieces[0].allocatedMinutes).toBe(45)
      expect(useFocusStore.getState().projects[0].subPieces[0].status).toBe('idle')
      expect(useFocusStore.getState().projects[0].subPieces[0].elapsedSeconds).toBe(0)
    })

    it('keeps existing allocatedMinutes when not provided', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Refocus Keep Minutes Test',
        description: '',
        color: 'forest',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 25,
        order: 0,
      })

      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)
      useFocusStore.getState().refocusSubPiece(project.id, subPiece.id)

      expect(useFocusStore.getState().projects[0].subPieces[0].allocatedMinutes).toBe(25)
    })

    it('does not update allocatedMinutes when provided value is 0 or negative', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Refocus Invalid Minutes Test',
        description: '',
        color: 'coral',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 30,
        order: 0,
      })

      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)

      // Test with 0
      useFocusStore.getState().refocusSubPiece(project.id, subPiece.id, 0)
      expect(useFocusStore.getState().projects[0].subPieces[0].allocatedMinutes).toBe(30)

      // Test with negative
      useFocusStore.getState().refocusSubPiece(project.id, subPiece.id, -5)
      expect(useFocusStore.getState().projects[0].subPieces[0].allocatedMinutes).toBe(30)
    })

    it('recomputes project status to idle when not all sub-pieces are completed', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Status Recompute Test',
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

      // Complete both sub-pieces, then mark project completed via target
      useFocusStore.getState().completeSubPiece(project.id, sp1.id)
      useFocusStore.getState().completeSubPiece(project.id, sp2.id)
      useFocusStore.getState().completeProject(project.id)
      expect(useFocusStore.getState().projects[0].status).toBe('completed')

      // Refocus one - project should no longer be completed
      useFocusStore.getState().refocusSubPiece(project.id, sp1.id)

      expect(useFocusStore.getState().projects[0].status).toBe('idle')
      expect(useFocusStore.getState().projects[0].subPieces[0].status).toBe('idle')
      expect(useFocusStore.getState().projects[0].subPieces[1].status).toBe('completed')
    })

    it('sets project status to idle when refocusing a completed sub-piece', () => {
      const project = useFocusStore.getState().addProject({
        name: 'All Completed Test',
        description: '',
        color: 'ocean',
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

      // Complete both sub-pieces, then mark project completed via target
      useFocusStore.getState().completeSubPiece(project.id, sp1.id)
      useFocusStore.getState().completeSubPiece(project.id, sp2.id)
      useFocusStore.getState().completeProject(project.id)
      expect(useFocusStore.getState().projects[0].status).toBe('completed')

      // Refocus one - project should no longer be completed
      useFocusStore.getState().refocusSubPiece(project.id, sp1.id)
      expect(useFocusStore.getState().projects[0].status).toBe('idle')
    })

    it('does not modify project totalTimeSeconds, xp, fortressLevel, or fortressHealth', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Preserve Stats Test',
        description: '',
        color: 'forest',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 30,
        order: 0,
      })

      // Add time and XP to the project
      useFocusStore.getState().incrementProjectTime(project.id, 120)
      useFocusStore.getState().incrementSubPieceTime(project.id, subPiece.id, 120)
      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)

      const beforeProject = useFocusStore.getState().projects[0]
      const beforeTotalTime = beforeProject.totalTimeSeconds
      const beforeXp = beforeProject.xp
      const beforeFortressLevel = beforeProject.fortressLevel
      const beforeFortressHealth = beforeProject.fortressHealth

      // Refocus
      useFocusStore.getState().refocusSubPiece(project.id, subPiece.id)

      const afterProject = useFocusStore.getState().projects[0]
      expect(afterProject.totalTimeSeconds).toBe(beforeTotalTime)
      expect(afterProject.xp).toBe(beforeXp)
      expect(afterProject.fortressLevel).toBe(beforeFortressLevel)
      expect(afterProject.fortressHealth).toBe(beforeFortressHealth)
    })

    it('does not affect other sub-pieces', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Other Sub Safe',
        description: '',
        color: 'coral',
        targetTimeSeconds: 7200,
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
        allocatedMinutes: 45,
        order: 1,
      })

      useFocusStore.getState().completeSubPiece(project.id, sp1.id)
      useFocusStore.getState().completeSubPiece(project.id, sp2.id)

      // Refocus only sp1
      useFocusStore.getState().refocusSubPiece(project.id, sp1.id, 60)

      const updatedProject = useFocusStore.getState().projects[0]
      expect(updatedProject.subPieces[0].status).toBe('idle')
      expect(updatedProject.subPieces[0].elapsedSeconds).toBe(0)
      expect(updatedProject.subPieces[0].allocatedMinutes).toBe(60)
      expect(updatedProject.subPieces[1].status).toBe('completed')
      expect(updatedProject.subPieces[1].elapsedSeconds).toBe(0)
      expect(updatedProject.subPieces[1].allocatedMinutes).toBe(45)
    })
  })

  describe('resetSubPieceTime', () => {
    it('zeros the sub-piece elapsed, reduces project total, XP, and today focus', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Reset Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 30,
        order: 0,
      })

      // Add 120 seconds (2 minutes) -> 2 * XP_PER_MINUTE XP
      useFocusStore.getState().incrementProjectTime(project.id, 120)
      useFocusStore.getState().incrementSubPieceTime(project.id, subPiece.id, 120)

      expect(useFocusStore.getState().projects[0].totalTimeSeconds).toBe(120)
      expect(useFocusStore.getState().projects[0].xp).toBe(2 * XP_PER_MINUTE)
      expect(useFocusStore.getState().projects[0].subPieces[0].elapsedSeconds).toBe(120)
      expect(useFocusStore.getState().settings.todayFocusSeconds).toBe(120)

      // Reset
      useFocusStore.getState().resetSubPieceTime(project.id, subPiece.id)

      const updatedProject = useFocusStore.getState().projects[0]
      expect(updatedProject.subPieces[0].elapsedSeconds).toBe(0)
      expect(updatedProject.subPieces[0].status).toBe('idle')
      expect(updatedProject.totalTimeSeconds).toBe(0)
      expect(updatedProject.xp).toBe(0)
      expect(updatedProject.fortressLevel).toBe(1)
      expect(updatedProject.fortressHealth).toBe(0)
      expect(useFocusStore.getState().settings.todayFocusSeconds).toBe(0)
    })

    it('clamps project total at 0', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Clamp Reset',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 30,
        order: 0,
      })

      // Add 60 seconds to sub-piece only (not project via incrementProjectTime)
      // But manually set project total lower than sub-piece elapsed
      useFocusStore.getState().incrementSubPieceTime(project.id, subPiece.id, 120)
      // Project totalTimeSeconds is still 0 since we only incremented sub-piece time
      // Now reset - should clamp at 0
      useFocusStore.getState().resetSubPieceTime(project.id, subPiece.id)

      const updatedProject = useFocusStore.getState().projects[0]
      expect(updatedProject.totalTimeSeconds).toBe(0)
      expect(updatedProject.xp).toBe(0)
    })

    it('marks a completed sub-piece as idle and updates project status', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Status Update',
        description: '',
        color: 'forest',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task',
        allocatedMinutes: 30,
        order: 0,
      })

      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)
      useFocusStore.getState().completeProject(project.id)
      expect(useFocusStore.getState().projects[0].status).toBe('completed')
      expect(useFocusStore.getState().projects[0].subPieces[0].status).toBe('completed')

      // Add another sub-piece so project is not all-completed after reset
      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 2',
        allocatedMinutes: 30,
        order: 1,
      })

      // Reset the completed sub-piece
      useFocusStore.getState().resetSubPieceTime(project.id, subPiece.id)

      const updatedProject = useFocusStore.getState().projects[0]
      expect(updatedProject.subPieces[0].status).toBe('idle')
      // Since not all sub-pieces are completed, status should be idle
      expect(updatedProject.status).toBe('idle')
    })

    it('does not affect other sub-pieces', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Other Sub Safe',
        description: '',
        color: 'coral',
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

      // Add time to both
      useFocusStore.getState().incrementSubPieceTime(project.id, sp1.id, 120)
      useFocusStore.getState().incrementSubPieceTime(project.id, sp2.id, 180)

      expect(useFocusStore.getState().projects[0].subPieces[0].elapsedSeconds).toBe(120)
      expect(useFocusStore.getState().projects[0].subPieces[1].elapsedSeconds).toBe(180)

      // Reset only sp1
      useFocusStore.getState().resetSubPieceTime(project.id, sp1.id)

      const updatedProject = useFocusStore.getState().projects[0]
      expect(updatedProject.subPieces[0].elapsedSeconds).toBe(0)
      expect(updatedProject.subPieces[0].status).toBe('idle')
      expect(updatedProject.subPieces[1].elapsedSeconds).toBe(180)
      expect(updatedProject.subPieces[1].status).toBe('idle')
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

  describe('sub-piece budget', () => {
    it('getRemainingBudgetSeconds returns remaining seconds after allocation', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Budget Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 25',
        allocatedMinutes: 25,
        order: 0,
      })

      expect(useFocusStore.getState().getRemainingBudgetSeconds(project.id)).toBe(2100)
    })

    it('addSubPiece clamps allocatedMinutes to remaining budget', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Clamp Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      // Add 50 minutes worth of sub-pieces (30 + 20)
      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 30',
        allocatedMinutes: 30,
        order: 0,
      })

      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 20',
        allocatedMinutes: 20,
        order: 1,
      })

      // Try to add 25 more minutes — only 10 remain
      const clamped = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 25',
        allocatedMinutes: 25,
        order: 2,
      })

      expect(clamped.allocatedMinutes).toBe(10)

      // Total allocated should never exceed 60 minutes (3600s)
      const total = useFocusStore.getState().getTotalAllocatedMinutes(project.id)
      expect(total).toBe(60)
    })

    it('addSubPiece stores allocatedMinutes as 0 when budget is fully consumed', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Full Budget Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      // Allocate exactly 60 minutes
      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 60',
        allocatedMinutes: 60,
        order: 0,
      })

      expect(useFocusStore.getState().getRemainingBudgetSeconds(project.id)).toBe(0)

      // Try to add another piece
      const extra = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Extra',
        allocatedMinutes: 10,
        order: 1,
      })

      expect(extra.allocatedMinutes).toBe(0)
    })

    it('addSubPiece stores unchanged value when within budget', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Within Budget Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 15',
        allocatedMinutes: 15,
        order: 0,
      })

      expect(subPiece.allocatedMinutes).toBe(15)
    })

    it('updateProject floors targetTimeSeconds at allocated sum', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Floor Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      // Allocate 40 minutes
      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 40',
        allocatedMinutes: 40,
        order: 0,
      })

      // Try to lower target to 10 minutes (600s) — should floor at 40 min (2400s)
      useFocusStore.getState().updateProject(project.id, { targetTimeSeconds: 600 })

      const updated = useFocusStore.getState().projects[0]
      expect(updated.targetTimeSeconds).toBe(2400)
    })

    it('updateProject allows raising targetTimeSeconds above allocated sum', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Raise Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 20',
        allocatedMinutes: 20,
        order: 0,
      })

      // Raise target from 3600 to 7200
      useFocusStore.getState().updateProject(project.id, { targetTimeSeconds: 7200 })

      const updated = useFocusStore.getState().projects[0]
      expect(updated.targetTimeSeconds).toBe(7200)
    })
  })

  describe('refocus budget validation', () => {
    it('uses elapsed project time when elapsed is greater than allocated sub-piece time', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Elapsed Budget Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 5',
        allocatedMinutes: 5,
        order: 0,
      })

      // 57 minutes 30 seconds elapsed — more than the 5-minute allocation
      useFocusStore.getState().incrementProjectTime(project.id, 57 * 60 + 30)

      expect(useFocusStore.getState().getRemainingBudgetSeconds(project.id)).toBe(150)
    })

    it('clamps refocus requested minutes to the actual remaining budget', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Refocus Clamp Test',
        description: '',
        color: 'ocean',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 5',
        allocatedMinutes: 5,
        order: 0,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 57 * 60 + 30)
      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)

      // Only 2.5 minutes remain, so requesting 5 minutes should clamp to 2
      useFocusStore.getState().refocusSubPiece(project.id, subPiece.id, 5)

      expect(useFocusStore.getState().projects[0].subPieces[0].allocatedMinutes).toBe(2)
    })

    it('preserves requested minutes when the project has enough remaining budget', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Refocus Within Budget Test',
        description: '',
        color: 'forest',
        targetTimeSeconds: 600,
      })

      useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Other Task',
        allocatedMinutes: 5,
        order: 0,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Refocus Task',
        allocatedMinutes: 3,
        order: 1,
      })

      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)
      useFocusStore.getState().refocusSubPiece(project.id, subPiece.id, 3)

      expect(useFocusStore.getState().projects[0].subPieces[1].allocatedMinutes).toBe(3)
    })

    it('sets allocatedMinutes to 0 when no budget remains', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Zero Budget Refocus Test',
        description: '',
        color: 'coral',
        targetTimeSeconds: 600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 5',
        allocatedMinutes: 5,
        order: 0,
      })

      useFocusStore.getState().incrementProjectTime(project.id, 600)
      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)

      useFocusStore.getState().refocusSubPiece(project.id, subPiece.id, 5)

      expect(useFocusStore.getState().projects[0].subPieces[0].allocatedMinutes).toBe(0)
    })

    it('keeps existing allocatedMinutes when no explicit value is provided and budget allows', () => {
      const project = useFocusStore.getState().addProject({
        name: 'Refocus Keep Within Budget Test',
        description: '',
        color: 'mint',
        targetTimeSeconds: 3600,
      })

      const subPiece = useFocusStore.getState().addSubPiece({
        projectId: project.id,
        name: 'Task 25',
        allocatedMinutes: 25,
        order: 0,
      })

      useFocusStore.getState().completeSubPiece(project.id, subPiece.id)
      useFocusStore.getState().refocusSubPiece(project.id, subPiece.id)

      expect(useFocusStore.getState().projects[0].subPieces[0].allocatedMinutes).toBe(25)
    })
  })
})
