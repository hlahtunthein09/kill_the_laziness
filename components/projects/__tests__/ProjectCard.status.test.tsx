import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Project } from '@/lib/types'

const setActiveProjectMock = vi.fn()
const addSubPieceMock = vi.fn()
const getRemainingBudgetSecondsMock = vi.fn(() => 3600)

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: (selector: (state: { activeProjectId: string | null; setActiveProject: typeof setActiveProjectMock; addSubPiece: typeof addSubPieceMock; getRemainingBudgetSeconds: typeof getRemainingBudgetSecondsMock }) => unknown) =>
    selector({
      activeProjectId: null,
      setActiveProject: setActiveProjectMock,
      addSubPiece: addSubPieceMock,
      getRemainingBudgetSeconds: getRemainingBudgetSecondsMock,
    }),
}))

import { ProjectCard } from '../ProjectCard'

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    name: 'Test Project',
    description: 'A test description',
    color: 'mint',
    createdAt: Date.now(),
    totalTimeSeconds: 0,
    targetTimeSeconds: 3600,
    status: 'idle',
    fortressLevel: 1,
    fortressHealth: 100,
    xp: 0,
    subPieces: [],
    ...overrides,
  }
}

describe('ProjectCard status badge colors', () => {
  beforeEach(() => {
    setActiveProjectMock.mockClear()
    addSubPieceMock.mockClear()
    getRemainingBudgetSecondsMock.mockClear()
  })

  it('idle status badge has muted color classes', () => {
    const { container } = render(<ProjectCard project={createMockProject({ status: 'idle' })} />)
    const badge = container.querySelector('[class*="bg-muted"]')
    expect(badge).toBeInTheDocument()
    expect(container.querySelector('[class*="text-muted-foreground"]')).toBeInTheDocument()
    expect(container.querySelector('[class*="border-border"]')).toBeInTheDocument()
  })

  it('running status badge has primary color classes', () => {
    const { container } = render(<ProjectCard project={createMockProject({ status: 'running' })} />)
    const badge = container.querySelector('[class*="bg-primary/10"]')
    expect(badge).toBeInTheDocument()
    expect(container.querySelector('[class*="text-primary"]')).toBeInTheDocument()
    expect(container.querySelector('[class*="border-primary/30"]')).toBeInTheDocument()
  })

  it('paused status badge has amber color classes', () => {
    const { container } = render(<ProjectCard project={createMockProject({ status: 'paused' })} />)
    const badge = container.querySelector('[class*="bg-amber-500/10"]')
    expect(badge).toBeInTheDocument()
    expect(container.querySelector('[class*="text-amber-400"]')).toBeInTheDocument()
    expect(container.querySelector('[class*="border-amber-500/30"]')).toBeInTheDocument()
  })

  it('completed status badge has emerald color classes', () => {
    const { container } = render(<ProjectCard project={createMockProject({ status: 'completed' })} />)
    const badge = container.querySelector('[class*="bg-emerald-500/10"]')
    expect(badge).toBeInTheDocument()
    expect(container.querySelector('[class*="text-emerald-400"]')).toBeInTheDocument()
    expect(container.querySelector('[class*="border-emerald-500/30"]')).toBeInTheDocument()
  })
})
