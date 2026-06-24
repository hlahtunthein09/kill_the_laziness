import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Project } from '@/lib/types'

const setActiveProjectMock = vi.fn()
const addSubPieceMock = vi.fn()

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: (selector: (state: { activeProjectId: string | null; setActiveProject: typeof setActiveProjectMock; addSubPiece: typeof addSubPieceMock }) => unknown) =>
    selector({
      activeProjectId: null,
      setActiveProject: setActiveProjectMock,
      addSubPiece: addSubPieceMock,
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
  })

  it('idle status badge has stone color classes', () => {
    const { container } = render(<ProjectCard project={createMockProject({ status: 'idle' })} />)
    const badge = container.querySelector('.bg-stone-100')
    expect(badge).toBeInTheDocument()
    expect(container.querySelector('.text-stone-600')).toBeInTheDocument()
    expect(container.querySelector('.border-stone-200')).toBeInTheDocument()
  })

  it('running status badge has teal color classes', () => {
    const { container } = render(<ProjectCard project={createMockProject({ status: 'running' })} />)
    const badge = container.querySelector('.bg-teal-100')
    expect(badge).toBeInTheDocument()
    expect(container.querySelector('.text-teal-700')).toBeInTheDocument()
    expect(container.querySelector('.border-teal-200')).toBeInTheDocument()
  })

  it('paused status badge has amber color classes', () => {
    const { container } = render(<ProjectCard project={createMockProject({ status: 'paused' })} />)
    const badge = container.querySelector('.bg-amber-100')
    expect(badge).toBeInTheDocument()
    expect(container.querySelector('.text-amber-700')).toBeInTheDocument()
    expect(container.querySelector('.border-amber-200')).toBeInTheDocument()
  })

  it('completed status badge has emerald color classes', () => {
    const { container } = render(<ProjectCard project={createMockProject({ status: 'completed' })} />)
    const badge = container.querySelector('.bg-emerald-100')
    expect(badge).toBeInTheDocument()
    expect(container.querySelector('.text-emerald-700')).toBeInTheDocument()
    expect(container.querySelector('.border-emerald-200')).toBeInTheDocument()
  })
})
