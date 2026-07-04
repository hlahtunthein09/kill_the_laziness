import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Project } from '@/lib/types'

const setActiveProjectMock = vi.fn()
const restartProjectMock = vi.fn()
const updateProjectMock = vi.fn()
const getProjectByIdMock = vi.fn((id: string) => ({
  id,
  name: 'Mock Project',
  targetTimeSeconds: 7200,
  totalTimeSeconds: 0,
}))
const getRemainingBudgetSecondsMock = vi.fn(() => 3600)
let mockActiveProjectId: string | null = null

function useFocusStore(selector: (state: { activeProjectId: string | null; setActiveProject: typeof setActiveProjectMock; restartProject: typeof restartProjectMock; updateProject: typeof updateProjectMock; getProjectById: typeof getProjectByIdMock; getRemainingBudgetSeconds: typeof getRemainingBudgetSecondsMock }) => unknown) {
  return selector({
    activeProjectId: mockActiveProjectId,
    setActiveProject: setActiveProjectMock,
    restartProject: restartProjectMock,
    updateProject: updateProjectMock,
    getProjectById: getProjectByIdMock,
    getRemainingBudgetSeconds: getRemainingBudgetSecondsMock,
  })
}
useFocusStore.getState = () => ({
  activeProjectId: mockActiveProjectId,
  setActiveProject: setActiveProjectMock,
  restartProject: restartProjectMock,
  updateProject: updateProjectMock,
  getProjectById: getProjectByIdMock,
  getRemainingBudgetSeconds: getRemainingBudgetSecondsMock,
})

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore,
}))

// Import after mock is set up
import { ProjectCard } from '../ProjectCard'
import { mockPush } from '../../../__mocks__/next-navigation'

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
    restartProjectMock.mockClear()
    updateProjectMock.mockClear()
    getProjectByIdMock.mockClear()
    getRemainingBudgetSecondsMock.mockClear()
    getRemainingBudgetSecondsMock.mockReturnValue(3600)
    mockPush.mockClear()
    mockActiveProjectId = null
  })

  it('shows active badge when project is active', () => {
    mockActiveProjectId = 'proj-1'

    const { container } = render(<ProjectCard project={createMockProject({ id: 'proj-1' })} />)

    expect(screen.getByText(/လက်ရှိ focus လုပ်နေသည်/)).toBeInTheDocument()
    expect(screen.getByText(/Currently focusing/)).toBeInTheDocument()
    expect(container.querySelector('.ring-2')).toBeInTheDocument()
    expect(container.querySelector('.ring-primary')).toBeInTheDocument()
    expect(container.querySelector('.border-primary')).toBeInTheDocument()
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
    // The time appears in the footer as "အသုံးပြုပြီးသောအချိန် (Time used): ..."
    const footer = screen.getByText(/အသုံးပြုပြီးသောအချိန်/i)
    expect(footer).toBeInTheDocument()
    expect(footer.textContent).toMatch(/1h 1m/)
  })

  it('shows status badge', () => {
    render(<ProjectCard project={createMockProject()} />)

    expect(screen.getByText(/မပြီးပြတ်သေးပါ/)).toBeInTheDocument()
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

  it('shows completed green border when project has reached its target', () => {
    const { container } = render(
      <ProjectCard project={createMockProject({ status: 'completed', totalTimeSeconds: 7200, targetTimeSeconds: 7200 })} />
    )

    expect(screen.getByText(/ပြီးစီး/)).toBeInTheDocument()
    expect(screen.getByText(/Completed/)).toBeInTheDocument()
    expect(container.querySelector('.border-emerald-500')).toBeInTheDocument()
  })

  it('active styling takes precedence over completed border', () => {
    mockActiveProjectId = 'proj-1'

    const { container } = render(
      <ProjectCard project={createMockProject({ id: 'proj-1', status: 'completed' })} />
    )

    // Active styling should be present
    expect(container.querySelector('.ring-2')).toBeInTheDocument()
    expect(container.querySelector('.ring-primary')).toBeInTheDocument()
    expect(container.querySelector('.border-primary')).toBeInTheDocument()

    // Completed border should NOT be present (active takes precedence)
    const card = container.querySelector('.border-emerald-500')
    expect(card).not.toBeInTheDocument()
  })

  it('clicking focus button on project with no sub-pieces sets active and navigates to /timer', () => {
    render(<ProjectCard project={createMockProject({ id: 'proj-empty', subPieces: [] })} />)

    const focusButton = screen.getByRole('button', { name: /whole project/i })
    expect(focusButton).toBeInTheDocument()

    fireEvent.click(focusButton)

    expect(setActiveProjectMock).toHaveBeenCalledTimes(1)
    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-empty')
    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  it('clicking focus button on project with sub-pieces sets active and navigates to /timer', () => {
    render(
      <ProjectCard
        project={createMockProject({
          id: 'proj-with-sub',
          subPieces: [
            {
              id: 'sp-1',
              projectId: 'proj-with-sub',
              name: 'Existing Sub-piece',
              allocatedMinutes: 30,
              elapsedSeconds: 0,
              status: 'idle',
              order: 0,
            },
          ],
        })}
      />
    )

    const focusButton = screen.getByRole('button', { name: /whole project/i })
    expect(focusButton).toBeInTheDocument()

    fireEvent.click(focusButton)

    expect(setActiveProjectMock).toHaveBeenCalledTimes(1)
    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-with-sub')
    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  it('clicking focus button on project with all completed sub-pieces sets active and navigates to /timer', () => {
    render(
      <ProjectCard
        project={createMockProject({
          id: 'proj-completed',
          subPieces: [
            {
              id: 'sp-1',
              projectId: 'proj-completed',
              name: 'Old Sub-piece',
              allocatedMinutes: 30,
              elapsedSeconds: 1800,
              status: 'completed',
              order: 0,
            },
          ],
        })}
      />
    )

    const focusButton = screen.getByRole('button', { name: /whole project/i })
    expect(focusButton).toBeInTheDocument()

    fireEvent.click(focusButton)

    expect(setActiveProjectMock).toHaveBeenCalledTimes(1)
    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-completed')
    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  it('clicking focus button on a completed project opens the confirmation dialog', () => {
    render(
      <ProjectCard
        project={createMockProject({
          id: 'proj-completed-status',
          status: 'completed',
          totalTimeSeconds: 7200,
          targetTimeSeconds: 7200,
        })}
      />
    )

    const focusButton = screen.getByRole('button', { name: /whole project/i })
    fireEvent.click(focusButton)

    // Dialog should be open with the confirmation title
    expect(screen.getByText(/ပရောဂျက်ပြီးစီးသွားပါပြီ/)).toBeInTheDocument()
    expect(screen.getByText(/Project Completed/)).toBeInTheDocument()

    // Should NOT have set active project or navigated yet
    expect(setActiveProjectMock).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('clicking Cancel in the completed-project dialog does not restart or navigate', () => {
    render(
      <ProjectCard
        project={createMockProject({
          id: 'proj-cancel-test',
          status: 'completed',
          totalTimeSeconds: 7200,
          targetTimeSeconds: 7200,
        })}
      />
    )

    const focusButton = screen.getByRole('button', { name: /whole project/i })
    fireEvent.click(focusButton)

    // Dialog is open
    expect(screen.getByText(/ပရောဂျက်ပြီးစီးသွားပါပြီ/)).toBeInTheDocument()

    // Click Cancel
    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    // Should NOT have called restartProject, setActiveProject, or navigated
    expect(restartProjectMock).not.toHaveBeenCalled()
    expect(updateProjectMock).not.toHaveBeenCalled()
    expect(setActiveProjectMock).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('clicking Restart in the completed-project dialog restarts the project and navigates', () => {
    render(
      <ProjectCard
        project={createMockProject({
          id: 'proj-confirm-test',
          status: 'completed',
          totalTimeSeconds: 7200,
          targetTimeSeconds: 7200,
        })}
      />
    )

    const focusButton = screen.getByRole('button', { name: /whole project/i })
    fireEvent.click(focusButton)

    // Dialog is open
    expect(screen.getByText(/ပရောဂျက်ပြီးစီးသွားပါပြီ/)).toBeInTheDocument()

    // Click Restart
    const restartButton = screen.getByRole('button', { name: /Restart/i })
    fireEvent.click(restartButton)

    // Should have called restartProject
    expect(restartProjectMock).toHaveBeenCalledTimes(1)
    expect(restartProjectMock).toHaveBeenCalledWith('proj-confirm-test')

    // Should have set active project and navigated
    expect(setActiveProjectMock).toHaveBeenCalledTimes(1)
    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-confirm-test')
    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })
})
