import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Project } from '@/lib/types'

const setActiveProjectMock = vi.fn()
let mockActiveProjectId: string | null = null

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: (selector: (state: { activeProjectId: string | null; setActiveProject: typeof setActiveProjectMock }) => unknown) =>
    selector({
      activeProjectId: mockActiveProjectId,
      setActiveProject: setActiveProjectMock,
    }),
}))

// Import after mock is set up
import { ProjectCard } from '../ProjectCard'

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    name: 'Test Project',
    description: 'A test description',
    color: 'mint',
    createdAt: Date.now(),
    totalTimeSeconds: 3661, // 1h 1m 1s
    targetTimeSeconds: 7200, // 2h
    status: 'idle',
    fortressLevel: 1,
    fortressHealth: 100,
    xp: 0,
    subPieces: [],
    ...overrides,
  }
}

describe('ProjectCard', () => {
  beforeEach(() => {
    setActiveProjectMock.mockClear()
    mockActiveProjectId = null
  })

  it('shows active badge when project is active', () => {
    mockActiveProjectId = 'proj-1'

    const { container } = render(<ProjectCard project={createMockProject({ id: 'proj-1' })} />)

    expect(screen.getByText(/လက်ရှိ focus လုပ်နေသည်/)).toBeInTheDocument()
    expect(screen.getByText(/Currently focusing/)).toBeInTheDocument()
    expect(container.querySelector('.ring-2')).toBeInTheDocument()
    expect(container.querySelector('.ring-teal-500')).toBeInTheDocument()
    expect(container.querySelector('.border-teal-500')).toBeInTheDocument()
  })

  it('does not show active badge when project is inactive', () => {
    mockActiveProjectId = 'proj-other'

    const { container } = render(<ProjectCard project={createMockProject({ id: 'proj-1' })} />)

    expect(screen.queryByText(/လက်ရှိ focus လုပ်နေသည်/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Currently focusing/)).not.toBeInTheDocument()
    expect(container.querySelector('.ring-2')).not.toBeInTheDocument()
  })

  it('shows project name', () => {
    render(<ProjectCard project={createMockProject()} />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('shows description when provided', () => {
    render(<ProjectCard project={createMockProject()} />)

    expect(screen.getByText('A test description')).toBeInTheDocument()
  })

  it('does not show description when empty', () => {
    render(<ProjectCard project={createMockProject({ description: '' })} />)

    expect(screen.queryByText('A test description')).not.toBeInTheDocument()
  })

  it('shows progress bar', () => {
    render(<ProjectCard project={createMockProject()} />)

    // Progress should be ~51% (3661/7200 * 100)
    expect(screen.getByText(/51%/)).toBeInTheDocument()
  })

  it('shows formatted total time', () => {
    render(<ProjectCard project={createMockProject()} />)

    // 3661 seconds = 1h 1m (seconds only shown when hours=0)
    // The time appears in the footer as "စုစုပေါင်း အချိန်: 1h 1m (Total time: 1h 1m)"
    const footer = screen.getByText(/စုစုပေါင်း အချိန်/i)
    expect(footer).toBeInTheDocument()
    expect(footer.textContent).toMatch(/1h 1m/)
  })

  it('shows status badge', () => {
    render(<ProjectCard project={createMockProject()} />)

    expect(screen.getByText(/အားနေသည်/)).toBeInTheDocument()
    expect(screen.getByText(/Idle/)).toBeInTheDocument()
  })

  it('shows different color based on project color', () => {
    const { container: mintContainer } = render(
      <ProjectCard project={createMockProject({ color: 'mint' })} />
    )
    expect(mintContainer.querySelector('.bg-teal-400')).toBeInTheDocument()

    const { container: oceanContainer } = render(
      <ProjectCard project={createMockProject({ color: 'ocean' })} />
    )
    expect(oceanContainer.querySelector('.bg-sky-400')).toBeInTheDocument()
  })

  it('clicking focus button calls setActiveProject with project id', () => {
    render(<ProjectCard project={createMockProject({ id: 'proj-abc' })} />)

    const focusButton = screen.getByRole('button', { name: /focus/i })
    expect(focusButton).toBeInTheDocument()

    fireEvent.click(focusButton)

    expect(setActiveProjectMock).toHaveBeenCalledTimes(1)
    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-abc')
  })
})
