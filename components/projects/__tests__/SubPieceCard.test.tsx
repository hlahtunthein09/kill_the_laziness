import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { SubPiece } from '@/lib/types'

const setActiveProjectMock = vi.fn()
const setActiveSubPieceMock = vi.fn()
const refocusSubPieceMock = vi.fn()
const mockPush = vi.fn()

const mockStoreState = {
  setActiveProject: setActiveProjectMock,
  setActiveSubPiece: setActiveSubPieceMock,
  refocusSubPiece: refocusSubPieceMock,
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

describe('SubPieceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    const subPiece = createMockSubPiece({ status: 'completed', id: 'sp-refocus', allocatedMinutes: 25 })
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
    const subPiece = createMockSubPiece({ status: 'completed', id: 'sp-input', allocatedMinutes: 25 })
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
})
