import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Project } from '@/lib/types'

const setActiveProjectMock = vi.fn()
const updateProjectMock = vi.fn()
const deleteProjectMock = vi.fn()
const getRemainingBudgetSecondsMock = vi.fn(() => 3600)
let mockActiveProjectId: string | null = null

function useFocusStore(selector: (state: {
  activeProjectId: string | null;
  setActiveProject: typeof setActiveProjectMock;
  updateProject: typeof updateProjectMock;
  deleteProject: typeof deleteProjectMock;
  getRemainingBudgetSeconds: typeof getRemainingBudgetSecondsMock;
}) => unknown) {
  return selector({
    activeProjectId: mockActiveProjectId,
    setActiveProject: setActiveProjectMock,
    updateProject: updateProjectMock,
    deleteProject: deleteProjectMock,
    getRemainingBudgetSeconds: getRemainingBudgetSecondsMock,
  })
}
useFocusStore.getState = () => ({
  activeProjectId: mockActiveProjectId,
  setActiveProject: setActiveProjectMock,
  updateProject: updateProjectMock,
  deleteProject: deleteProjectMock,
  getRemainingBudgetSeconds: getRemainingBudgetSecondsMock,
})

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore,
}))

import { ProjectCard } from '../ProjectCard'

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    name: 'Test Project',
    description: 'A test description',
    color: 'mint',
    createdAt: Date.now(),
    totalTimeSeconds: 3661,
    targetTimeSeconds: 7200,
    status: 'idle',
    fortressLevel: 1,
    fortressHealth: 100,
    xp: 0,
    subPieces: [],
    ...overrides,
  }
}

describe('ProjectCard delete dialog', () => {
  beforeEach(() => {
    setActiveProjectMock.mockClear()
    updateProjectMock.mockClear()
    deleteProjectMock.mockClear()
    getRemainingBudgetSecondsMock.mockClear()
    getRemainingBudgetSecondsMock.mockReturnValue(3600)
    mockActiveProjectId = null
  })

  it('renders delete button (trash icon with aria-label)', () => {
    render(<ProjectCard project={createMockProject()} />)

    const deleteButton = screen.getByRole('button', { name: /Delete project/i })
    expect(deleteButton).toBeInTheDocument()
  })

  it('clicking delete button opens confirmation dialog with project name', () => {
    render(<ProjectCard project={createMockProject({ name: 'Alpha Project' })} />)

    const deleteButton = screen.getByRole('button', { name: /Delete project/i })
    fireEvent.click(deleteButton)

    expect(screen.getByText(/ပရောဂျက်ဖျက်ရန်သေချာပါသလား/)).toBeInTheDocument()
    expect(screen.getByText(/Delete Project/)).toBeInTheDocument()
    // Project name appears in the dialog description (not the card title)
    expect(screen.getByText(/This will permanently delete "Alpha Project"/)).toBeInTheDocument()
  })

  it('clicking Cancel closes dialog without calling deleteProject', () => {
    render(<ProjectCard project={createMockProject()} />)

    const deleteButton = screen.getByRole('button', { name: /Delete project/i })
    fireEvent.click(deleteButton)

    // Dialog is open
    expect(screen.getByText(/ပရောဂျက်ဖျက်ရန်သေချာပါသလား/)).toBeInTheDocument()

    // Click Cancel
    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    // Should NOT have called deleteProject
    expect(deleteProjectMock).not.toHaveBeenCalled()
  })

  it('clicking Delete calls deleteProject(project.id) and closes dialog', () => {
    render(<ProjectCard project={createMockProject({ id: 'proj-delete-me' })} />)

    const deleteButton = screen.getByRole('button', { name: /Delete project/i })
    fireEvent.click(deleteButton)

    // Dialog is open
    expect(screen.getByText(/ပရောဂျက်ဖျက်ရန်သေချာပါသလား/)).toBeInTheDocument()

    // Click Delete
    const confirmDeleteButton = screen.getByRole('button', { name: /Delete/i })
    fireEvent.click(confirmDeleteButton)

    // Should have called deleteProject with the project id
    expect(deleteProjectMock).toHaveBeenCalledTimes(1)
    expect(deleteProjectMock).toHaveBeenCalledWith('proj-delete-me')

    // Dialog should be closed (no longer showing the title)
    expect(screen.queryByText(/ပရောဂျက်ဖျက်ရန်သေချာပါသလား/)).not.toBeInTheDocument()
  })
})
