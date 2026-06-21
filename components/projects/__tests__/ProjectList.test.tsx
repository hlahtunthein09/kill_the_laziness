import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectList } from '../ProjectList'
import { useFocusStore } from '@/lib/store/useFocusStore'
import type { Project } from '@/lib/types'

// Mock the store
vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: vi.fn(),
}))

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    name: 'Test Project',
    description: 'A test description',
    color: 'mint',
    createdAt: Date.now(),
    totalTimeSeconds: 3600,
    targetTimeSeconds: 7200,
    status: 'idle',
    fortressLevel: 1,
    fortressHealth: 100,
    xp: 0,
    subPieces: [],
    ...overrides,
  }
}

describe('ProjectList', () => {
  it('renders multiple ProjectCards', () => {
    const projects = [
      createMockProject({ id: 'proj-1', name: 'Project One' }),
      createMockProject({ id: 'proj-2', name: 'Project Two', color: 'ocean' }),
      createMockProject({ id: 'proj-3', name: 'Project Three', color: 'forest' }),
    ]

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) => selector({ projects, hasHydrated: true }))

    render(<ProjectList />)

    expect(screen.getByText('Project One')).toBeInTheDocument()
    expect(screen.getByText('Project Two')).toBeInTheDocument()
    expect(screen.getByText('Project Three')).toBeInTheDocument()
  })

  it('shows empty state when no projects and hasHydrated is true', () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) => selector({ projects: [], hasHydrated: true }))

    render(<ProjectList />)

    expect(screen.getByText(/ပရောဂျက်များ မရှိသေးပါ/i)).toBeInTheDocument()
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument()
  })

  it('does NOT show empty state while hasHydrated is false', () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) => selector({ projects: [], hasHydrated: false }))

    render(<ProjectList />)

    expect(screen.queryByText(/ပရောဂျက်များ မရှိသေးပါ/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/No projects yet/i)).not.toBeInTheDocument()
  })

  it('renders correct number of project cards', () => {
    const projects = [
      createMockProject({ id: 'proj-1', name: 'Alpha' }),
      createMockProject({ id: 'proj-2', name: 'Beta' }),
    ]

    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) => selector({ projects, hasHydrated: true }))

    render(<ProjectList />)

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })
})
