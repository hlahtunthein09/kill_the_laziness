import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { SubPiece, Project } from '@/lib/types'

const setActiveProjectMock = vi.fn()
const setActiveSubPieceMock = vi.fn()
const refocusSubPieceMock = vi.fn()
const restartProjectMock = vi.fn()
const updateProjectMock = vi.fn()
const getProjectByIdMock = vi.fn((id: string): Project => ({
  id,
  name: 'Mock Project',
  description: '',
  color: 'mint',
  createdAt: 0,
  totalTimeSeconds: 0,
  targetTimeSeconds: 3600,
  status: 'idle',
  fortressLevel: 1,
  fortressHealth: 100,
  xp: 0,
  subPieces: [],
}))
const mockPush = vi.fn()

const mockStoreState = {
  setActiveProject: setActiveProjectMock,
  setActiveSubPiece: setActiveSubPieceMock,
  refocusSubPiece: refocusSubPieceMock,
  restartProject: restartProjectMock,
  updateProject: updateProjectMock,
  getProjectById: getProjectByIdMock,
}

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: Object.assign(
    (selector: (state: typeof mockStoreState) => unknown) => selector(mockStoreState),
    { getState: () => mockStoreState }
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Import after mocks are set up
import { SubPieceCard } from '../SubPieceCard'

function createMockSubPiece(overrides: Partial<SubPiece> = {}): SubPiece {
  return {
    id: 'sp-1',
    projectId: 'proj-1',
    name: 'Test SubPiece',
    allocatedMinutes: 25,
    elapsedSeconds: 0,
    status: 'idle',
    order: 0,
    ...overrides,
  }
}

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    name: 'Mock Project',
    description: '',
    color: 'mint',
    createdAt: 0,
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

describe('SubPieceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getProjectByIdMock.mockReturnValue(createMockProject())
  })

  it('renders sub-piece name and allocated time', () => {
    const subPiece = createMockSubPiece({ name: 'Design UI', allocatedMinutes: 30 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    expect(screen.getByText('Design UI')).toBeInTheDocument()
    expect(screen.getByText(/30 မိနစ်/)).toBeInTheDocument()
  })

  it('shows focus button for incomplete sub-piece', () => {
    const subPiece = createMockSubPiece({ status: 'idle' })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    expect(screen.getByTestId('focus-button')).toBeInTheDocument()
  })

  it('shows focus button for running sub-piece', () => {
    const subPiece = createMockSubPiece({ status: 'running' })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    expect(screen.getByTestId('focus-button')).toBeInTheDocument()
  })

  it('shows focus button for paused sub-piece', () => {
    const subPiece = createMockSubPiece({ status: 'paused' })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    expect(screen.getByTestId('focus-button')).toBeInTheDocument()
  })

  it('shows focus button for completed sub-piece', () => {
    const subPiece = createMockSubPiece({ status: 'completed' })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    expect(screen.getByTestId('focus-button')).toBeInTheDocument()
  })

  it('calls setActiveProject, setActiveSubPiece, and navigates to /timer on focus click for incomplete sub-piece', () => {
    const subPiece = createMockSubPiece({ id: 'sp-focus', projectId: 'proj-focus' })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-focus" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    expect(setActiveProjectMock).toHaveBeenCalledTimes(1)
    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-focus')

    expect(setActiveSubPieceMock).toHaveBeenCalledTimes(1)
    expect(setActiveSubPieceMock).toHaveBeenCalledWith('proj-focus', 'sp-focus')

    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  it('opens refocus dialog when focus button is clicked for completed sub-piece', () => {
    const subPiece = createMockSubPiece({ status: 'completed', allocatedMinutes: 25 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    expect(screen.getByText(/Refocus Sub-piece/)).toBeInTheDocument()
    expect(screen.getByTestId('refocus-duration-input')).toHaveValue(25)
  })

  it('cancel does not call refocusSubPiece or navigate', () => {
    const subPiece = createMockSubPiece({ status: 'completed' })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('focus-button'))
    fireEvent.click(screen.getByTestId('refocus-cancel-button'))

    expect(refocusSubPieceMock).not.toHaveBeenCalled()
    expect(setActiveProjectMock).not.toHaveBeenCalled()
    expect(setActiveSubPieceMock).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('confirm calls refocusSubPiece, sets active project/sub-piece, and navigates', () => {
    const subPiece = createMockSubPiece({ status: 'completed', id: 'sp-refocus', projectId: 'proj-refocus', allocatedMinutes: 25 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-refocus" />)

    fireEvent.click(screen.getByTestId('focus-button'))
    fireEvent.click(screen.getByTestId('refocus-confirm-button'))

    expect(refocusSubPieceMock).toHaveBeenCalledTimes(1)
    expect(refocusSubPieceMock).toHaveBeenCalledWith('proj-refocus', 'sp-refocus', 25)

    expect(setActiveProjectMock).toHaveBeenCalledTimes(1)
    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-refocus')

    expect(setActiveSubPieceMock).toHaveBeenCalledTimes(1)
    expect(setActiveSubPieceMock).toHaveBeenCalledWith('proj-refocus', 'sp-refocus')

    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  it('changing input value passes the new value to refocusSubPiece', () => {
    const subPiece = createMockSubPiece({ status: 'completed', id: 'sp-input', projectId: 'proj-input', allocatedMinutes: 25 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-input" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    const input = screen.getByTestId('refocus-duration-input')
    fireEvent.change(input, { target: { value: '45' } })

    fireEvent.click(screen.getByTestId('refocus-confirm-button'))

    expect(refocusSubPieceMock).toHaveBeenCalledWith('proj-input', 'sp-input', 45)
  })

  it('renders status dot with accessible title', () => {
    const subPiece = createMockSubPiece({ status: 'running' })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    const dot = screen.getByTestId('status-dot')
    expect(dot).toBeInTheDocument()
    expect(dot).toHaveAttribute('title', expect.stringContaining('Running'))
  })

  // Budget validation tests
  it('focus button blocks over-budget sub-piece and opens warning dialog', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      targetTimeSeconds: 3600,
      totalTimeSeconds: 3480, // 58 min elapsed, 2 min remaining
    }))
    const subPiece = createMockSubPiece({ allocatedMinutes: 5 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    expect(screen.getByText(/အချိန်မလုံလောက်ပါ/)).toBeInTheDocument()
    expect(setActiveProjectMock).not.toHaveBeenCalled()
    expect(setActiveSubPieceMock).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('focus button allows fitting sub-piece and navigates normally', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      targetTimeSeconds: 3600,
      totalTimeSeconds: 0,
    }))
    const subPiece = createMockSubPiece({ id: 'sp-fit', projectId: 'proj-fit', allocatedMinutes: 5 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-fit" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-fit')
    expect(setActiveSubPieceMock).toHaveBeenCalledWith('proj-fit', 'sp-fit')
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  it('warning dialog shows correct remaining and allocated minutes', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      name: 'Test Project',
      targetTimeSeconds: 3600,
      totalTimeSeconds: 3480,
    }))
    const subPiece = createMockSubPiece({ name: 'Over Budget', allocatedMinutes: 5 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    const description = screen.getByTestId('warning-description')
    expect(description).toHaveTextContent(/2 မိနစ်/)
    expect(description).toHaveTextContent(/5 မိနစ်/)
    expect(description).toHaveTextContent(/Test Project/)
    expect(description).toHaveTextContent(/Over Budget/)
  })

  it('warning dialog Extend target opens input dialog with default deficit value', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      id: 'proj-extend',
      targetTimeSeconds: 3600,
      totalTimeSeconds: 3480,
    }))
    const subPiece = createMockSubPiece({ id: 'sp-extend', projectId: 'proj-extend', allocatedMinutes: 5 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-extend" />)

    fireEvent.click(screen.getByTestId('focus-button'))
    fireEvent.click(screen.getByTestId('warning-extend-button'))

    expect(screen.getByTestId('extend-dialog')).toBeInTheDocument()
    expect(screen.getByText(/ပရောဂျက်အတွက် အချိန်တိုးမည်/)).toBeInTheDocument()
    expect(screen.getByTestId('extend-minutes-input')).toHaveValue(3)
    expect(updateProjectMock).not.toHaveBeenCalled()
    expect(setActiveProjectMock).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('warning dialog custom extend amount updates target and focuses sub-piece', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      id: 'proj-extend',
      targetTimeSeconds: 3600,
      totalTimeSeconds: 3480,
    }))
    const subPiece = createMockSubPiece({ id: 'sp-extend', projectId: 'proj-extend', allocatedMinutes: 5 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-extend" />)

    fireEvent.click(screen.getByTestId('focus-button'))
    fireEvent.click(screen.getByTestId('warning-extend-button'))

    const input = screen.getByTestId('extend-minutes-input')
    fireEvent.change(input, { target: { value: '10' } })
    fireEvent.click(screen.getByTestId('extend-confirm-button'))

    expect(updateProjectMock).toHaveBeenCalledTimes(1)
    expect(updateProjectMock).toHaveBeenCalledWith('proj-extend', { targetTimeSeconds: 3600 + 10 * 60 })
    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-extend')
    expect(setActiveSubPieceMock).toHaveBeenCalledWith('proj-extend', 'sp-extend')
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  it('warning dialog focus whole project button sets active project and navigates without sub-piece', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      targetTimeSeconds: 3600,
      totalTimeSeconds: 3480,
    }))
    const subPiece = createMockSubPiece({ allocatedMinutes: 5 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('focus-button'))
    fireEvent.click(screen.getByTestId('warning-focus-whole-button'))

    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-1')
    expect(setActiveSubPieceMock).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  it('refocus dialog shows inline error when input exceeds remaining target', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      targetTimeSeconds: 3600,
      totalTimeSeconds: 3480,
    }))
    const subPiece = createMockSubPiece({ status: 'completed', allocatedMinutes: 2 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    const input = screen.getByTestId('refocus-duration-input')
    fireEvent.change(input, { target: { value: '5' } })

    expect(screen.getByTestId('refocus-error')).toBeInTheDocument()
    expect(screen.getByText(/2 မိနစ်သာ ကျန်ပါတယ်/)).toBeInTheDocument()
    expect(screen.getByTestId('refocus-confirm-button')).toBeDisabled()
  })

  it('refocus dialog allows valid input and confirms', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      targetTimeSeconds: 3600,
      totalTimeSeconds: 3480,
    }))
    const subPiece = createMockSubPiece({ status: 'completed', id: 'sp-valid', projectId: 'proj-valid', allocatedMinutes: 1 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-valid" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    const input = screen.getByTestId('refocus-duration-input')
    fireEvent.change(input, { target: { value: '2' } })

    expect(screen.queryByTestId('refocus-error')).not.toBeInTheDocument()
    expect(screen.getByTestId('refocus-confirm-button')).not.toBeDisabled()

    fireEvent.click(screen.getByTestId('refocus-confirm-button'))

    expect(refocusSubPieceMock).toHaveBeenCalledWith('proj-valid', 'sp-valid', 2)
    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-valid')
    expect(setActiveSubPieceMock).toHaveBeenCalledWith('proj-valid', 'sp-valid')
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  it('refocus dialog Extend target opens input dialog with default deficit value', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      id: 'proj-extend-refocus',
      targetTimeSeconds: 3600,
      totalTimeSeconds: 3480,
    }))
    const subPiece = createMockSubPiece({ status: 'completed', id: 'sp-extend-refocus', projectId: 'proj-extend-refocus', allocatedMinutes: 2 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-extend-refocus" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    const input = screen.getByTestId('refocus-duration-input')
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.click(screen.getByTestId('refocus-extend-button'))

    expect(screen.getByTestId('extend-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('extend-minutes-input')).toHaveValue(3)
    expect(updateProjectMock).not.toHaveBeenCalled()
    expect(refocusSubPieceMock).not.toHaveBeenCalled()
  })

  it('refocus dialog custom extend amount updates target and allows refocus', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      id: 'proj-extend-refocus',
      targetTimeSeconds: 3600,
      totalTimeSeconds: 3480,
    }))
    const subPiece = createMockSubPiece({ status: 'completed', id: 'sp-extend-refocus', projectId: 'proj-extend-refocus', allocatedMinutes: 2 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-extend-refocus" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    const refocusInput = screen.getByTestId('refocus-duration-input')
    fireEvent.change(refocusInput, { target: { value: '5' } })
    fireEvent.click(screen.getByTestId('refocus-extend-button'))

    const extendInput = screen.getByTestId('extend-minutes-input')
    fireEvent.change(extendInput, { target: { value: '10' } })
    fireEvent.click(screen.getByTestId('extend-confirm-button'))

    expect(updateProjectMock).toHaveBeenCalledTimes(1)
    expect(updateProjectMock).toHaveBeenCalledWith('proj-extend-refocus', { targetTimeSeconds: 3600 + 10 * 60 })
    expect(refocusSubPieceMock).toHaveBeenCalledWith('proj-extend-refocus', 'sp-extend-refocus', 5)
    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-extend-refocus')
    expect(setActiveSubPieceMock).toHaveBeenCalledWith('proj-extend-refocus', 'sp-extend-refocus')
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  // Detail dialog tests
  it('opens detail dialog when row body is clicked', () => {
    const subPiece = createMockSubPiece({ name: 'Design UI' })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('subpiece-row'))

    expect(screen.getByTestId('detail-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('detail-name')).toHaveTextContent('Design UI')
  })

  it('does not open detail dialog when inline focus button is clicked', () => {
    const subPiece = createMockSubPiece({ name: 'Design UI' })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('focus-button'))

    expect(screen.queryByTestId('detail-dialog')).not.toBeInTheDocument()
  })

  it('shows allocated minutes, elapsed time, and status in detail dialog', () => {
    const subPiece = createMockSubPiece({
      allocatedMinutes: 30,
      elapsedSeconds: 125,
      status: 'running',
    })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('subpiece-row'))

    expect(screen.getByTestId('detail-allocated')).toHaveTextContent('30 မိနစ်')
    expect(screen.getByTestId('detail-elapsed')).toHaveTextContent('2m 5s')
    expect(screen.getByTestId('detail-status')).toHaveTextContent('လုပ်ဆောင်နေသည်')
    expect(screen.getByTestId('detail-status')).toHaveTextContent('Running')
  })

  it('detail dialog focus button navigates for incomplete sub-piece', () => {
    const subPiece = createMockSubPiece({ id: 'sp-df', projectId: 'proj-df' })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-df" />)

    fireEvent.click(screen.getByTestId('subpiece-row'))
    fireEvent.click(screen.getByTestId('detail-focus-button'))

    expect(setActiveProjectMock).toHaveBeenCalledWith('proj-df')
    expect(setActiveSubPieceMock).toHaveBeenCalledWith('proj-df', 'sp-df')
    expect(mockPush).toHaveBeenCalledWith('/timer')
  })

  it('detail dialog focus button opens refocus dialog for completed sub-piece', () => {
    const subPiece = createMockSubPiece({ status: 'completed', allocatedMinutes: 25 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('subpiece-row'))
    fireEvent.click(screen.getByTestId('detail-focus-button'))

    expect(screen.getByText(/Refocus Sub-piece/)).toBeInTheDocument()
    expect(screen.getByTestId('refocus-duration-input')).toHaveValue(25)
  })

  it('detail dialog focus button opens warning dialog for over-budget sub-piece', () => {
    getProjectByIdMock.mockReturnValue(createMockProject({
      targetTimeSeconds: 3600,
      totalTimeSeconds: 3480,
    }))
    const subPiece = createMockSubPiece({ allocatedMinutes: 5 })
    render(<SubPieceCard subPiece={subPiece} projectId="proj-1" />)

    fireEvent.click(screen.getByTestId('subpiece-row'))
    fireEvent.click(screen.getByTestId('detail-focus-button'))

    expect(screen.getByText(/အချိန်မလုံလောက်ပါ/)).toBeInTheDocument()
    expect(setActiveProjectMock).not.toHaveBeenCalled()
    expect(setActiveSubPieceMock).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
