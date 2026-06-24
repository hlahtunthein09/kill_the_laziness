import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFocusStore } from '../useFocusStore'
import { DEFAULT_APP_SETTINGS, XP_PER_MINUTE, XP_SUB_PIECE_COMPLETE, LEVEL_THRESHOLDS } from '@/lib/constants'

describe('fortress computation', () => {
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

  it('new project starts at fortress level 1, health 100', () => {
    const project = useFocusStore.getState().addProject({
      name: 'Fortress Test',
      description: '',
      color: 'mint',
      targetTimeSeconds: 3600,
    })

    expect(project.fortressLevel).toBe(1)
    expect(project.fortressHealth).toBe(100)

    const stored = useFocusStore.getState().projects[0]
    expect(stored.fortressLevel).toBe(1)
    expect(stored.fortressHealth).toBe(100)
  })

  it('XP gain increases fortress level when threshold crossed', () => {
    const project = useFocusStore.getState().addProject({
      name: 'Level Up Test',
      description: '',
      color: 'ocean',
      targetTimeSeconds: 3600,
    })

    // Level 2 threshold is 200 XP. XP_PER_MINUTE = 5, so 40 minutes = 200 XP.
    const minutesToLevel2 = LEVEL_THRESHOLDS[1] / XP_PER_MINUTE // 40
    useFocusStore.getState().incrementProjectTime(project.id, minutesToLevel2 * 60)

    const updated = useFocusStore.getState().projects[0]
    expect(updated.xp).toBe(LEVEL_THRESHOLDS[1])
    expect(updated.fortressLevel).toBe(2)
  })

  it('fortress health reflects progress toward next level', () => {
    const project = useFocusStore.getState().addProject({
      name: 'Health Test',
      description: '',
      color: 'forest',
      targetTimeSeconds: 3600,
    })

    // Add enough XP to be halfway between level 1 (0) and level 2 (200).
    // Halfway = 100 XP. At 5 XP/minute, that's 20 minutes.
    useFocusStore.getState().incrementProjectTime(project.id, 20 * 60)

    const updated = useFocusStore.getState().projects[0]
    expect(updated.xp).toBe(100)
    expect(updated.fortressLevel).toBe(1)
    expect(updated.fortressHealth).toBe(50)
  })

  it('completeSubPiece updates fortress via XP bonus', () => {
    const project = useFocusStore.getState().addProject({
      name: 'Complete Bonus Test',
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

    // Pre-compute expected level/health after adding XP_SUB_PIECE_COMPLETE (50).
    // 50 XP is between level 1 (0) and level 2 (200).
    // Health = (50 / 200) * 100 = 25.
    useFocusStore.getState().completeSubPiece(project.id, subPiece.id)

    const updated = useFocusStore.getState().projects[0]
    expect(updated.xp).toBe(XP_SUB_PIECE_COMPLETE)
    expect(updated.fortressLevel).toBe(1)
    expect(updated.fortressHealth).toBe(25)
    expect(updated.subPieces[0].status).toBe('completed')
  })
})
