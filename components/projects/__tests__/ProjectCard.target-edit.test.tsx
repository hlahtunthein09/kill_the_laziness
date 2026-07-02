import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Project } from '@/lib/types'

const setActiveProjectMock = vi.fn()
const updateProjectMock = vi.fn()
const getRemainingBudgetSecondsMock = vi.fn(() => 3600)
let mockActiveProjectId: string | null = null

function useFocusStore(selector: (state: {
  activeProjectId: string | null;
  setActiveProject: typeof setActiveProjectMock;
  updateProject: typeof updateProjectMock;
  getRemainingBudgetSeconds: typeof getRemainingBudgetSecondsMock;
}) => unknown) {
  return selector({
    activeProjectId: mockActiveProjectId,
    setActiveProject: setActiveProjectMock,
    updateProject: updateProjectMock,
    getRemainingBudgetSeconds: getRemainingBudgetSecondsMock,
  })
}
useFocusStore.getState = () => ({
  activeProjectId: mockActiveProjectId,
  setActiveProject: setActiveProjectMock,
  updateProject: updateProjectMock,
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

describe('ProjectCard target edit dialog', () => {
  beforeEach(() => {
    setActiveProjectMock.mockClear()
    updateProjectMock.mockClear()
    getRemainingBudgetSecondsMock.mockClear()
    getRemainingBudgetSecondsMock.mockReturnValue(3600)
    mockActiveProjectId = null
  })

  it('renders the edit target button (pencil icon with aria-label)', () => {
    render(<ProjectCard project={createMockProject()} />)

    const editButtons = screen.getAllByRole('button', { name: /Edit target/i })
    expect(editButtons.length).toBeGreaterThanOrEqual(1)
    expect(editButtons[0]).toBeInTheDocument()
  })

  it('clicking the pencil button opens the target edit dialog', () => {
    render(<ProjectCard project={createMockProject()} />)

    const editButtons = screen.getAllByRole('button', { name: /Edit target/i })
    fireEvent.click(editButtons[0])

    expect(screen.getByText(/ပစ်မှတ်အချိန် ပြင်ရန်/)).toBeInTheDocument()
    expect(screen.getByText(/Edit Target/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target \(hours\)/i)).toBeInTheDocument()
  })

  it('saving a higher target calls updateProject with correct targetTimeSeconds', () => {
    render(<ProjectCard project={createMockProject({ targetTimeSeconds: 7200 })} />)

    const editButtons = screen.getAllByRole('button', { name: /Edit target/i })
    fireEvent.click(editButtons[0])

    // Dialog is open; change target to 3 hours
    const input = screen.getByLabelText(/Target \(hours\)/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: '3' } })

    const saveButton = screen.getByRole('button', { name: /သိမ်းဆည်းရန် \(Save\)/i })
    fireEvent.click(saveButton)

    expect(updateProjectMock).toHaveBeenCalledTimes(1)
    expect(updateProjectMock).toHaveBeenCalledWith('proj-1', {
      targetTimeSeconds: 10800, // 3 * 3600
    })
  })

  it('saving below allocated hours is floored to allocated sum', () => {
    // Project with sub-pieces summing to 40 min = 0.666...h allocated
    const project = createMockProject({
      id: 'proj-floored',
      targetTimeSeconds: 7200, // 2h current target
      subPieces: [
        {
          id: 'sp-1',
          projectId: 'proj-floored',
          name: 'Sub-piece 1',
          allocatedMinutes: 20,
          elapsedSeconds: 0,
          status: 'idle',
          order: 0,
        },
        {
          id: 'sp-2',
          projectId: 'proj-floored',
          name: 'Sub-piece 2',
          allocatedMinutes: 20,
          elapsedSeconds: 0,
          status: 'idle',
          order: 1,
        },
      ],
    })

    render(<ProjectCard project={project} />)

    const editButtons = screen.getAllByRole('button', { name: /Edit target/i })
    fireEvent.click(editButtons[0])

    // Enter 0.5h which is below 40min (0.666...h)
    const input = screen.getByLabelText(/Target \(hours\)/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: '0.5' } })

    // Submit the form directly
    const form = input.closest('form')!
    fireEvent.submit(form)

    expect(updateProjectMock).toHaveBeenCalledTimes(1)
    // Floored to 40/60 = 0.666...h, rounded to 1 decimal = 0.7h, * 3600 = 2520
    // Actually: Math.max(0.666..., Math.round(0.5 * 10) / 10) = Math.max(0.666..., 0.5) = 0.666...
    // Math.round(0.666... * 3600) = Math.round(2400) = 2400
    const expectedSeconds = Math.round(Math.max(40 / 60, Math.round(0.5 * 10) / 10) * 3600)
    expect(updateProjectMock).toHaveBeenCalledWith('proj-floored', {
      targetTimeSeconds: expectedSeconds,
    })
  })
})
