import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubPieceForm } from '../SubPieceForm'

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: {
    getState: vi.fn(() => ({
      getProjectById: vi.fn(() => ({ id: 'project-1', subPieces: [] })),
      addSubPiece: vi.fn((subPiece) => ({ id: 'test-subpiece-id', ...subPiece })),
    })),
  },
}))

describe('SubPieceForm', () => {
  const mockOnOpenChange = vi.fn()
  const projectId = 'project-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dialog content when open', () => {
    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    expect(screen.getByText(/အခန်းကဏ္ဍအသစ် ထည့်ရန်/i)).toBeInTheDocument()
    expect(screen.getByText(/Add New Sub-piece/i)).toBeInTheDocument()
  })

  it('does not render dialog content when closed', () => {
    render(<SubPieceForm open={false} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    expect(screen.queryByText(/အခန်းကဏ္ဍအသစ် ထည့်ရန်/i)).not.toBeInTheDocument()
  })

  it('inputs accept values', async () => {
    const user = userEvent.setup()
    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    const nameInput = screen.getByLabelText(/Sub-piece Name/i)
    const minutesInput = screen.getByLabelText(/Allocated Minutes/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Design API')
    await user.clear(minutesInput)
    await user.type(minutesInput, '45')

    expect(nameInput).toHaveValue('Design API')
    expect(minutesInput).toHaveValue(45)
  })

  it('submit button calls addSubPiece with correct data', async () => {
    const user = userEvent.setup()
    const mockAddSubPiece = vi.fn(() => ({ id: 'new-subpiece-id' }))
    const mockGetProjectById = vi.fn(() => ({ id: projectId, subPieces: [{ id: 'existing' }] }))

    const mockedModule = await import('@/lib/store/useFocusStore')
    // @ts-expect-error - mocking internal
    mockedModule.useFocusStore.getState = vi.fn(() => ({
      getProjectById: mockGetProjectById,
      addSubPiece: mockAddSubPiece,
    }))

    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    const nameInput = screen.getByLabelText(/Sub-piece Name/i)
    const minutesInput = screen.getByLabelText(/Allocated Minutes/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Implement Auth')
    await user.clear(minutesInput)
    await user.type(minutesInput, '30')

    const submitButton = screen.getByRole('button', { name: /သိမ်းဆည်းရန်/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockAddSubPiece).toHaveBeenCalledTimes(1)
    })

    expect(mockAddSubPiece).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId,
        name: 'Implement Auth',
        allocatedMinutes: 30,
        order: 1,
      })
    )
  })

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup()
    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    const nameInput = screen.getByLabelText(/Sub-piece Name/i)
    await user.clear(nameInput)

    const submitButton = screen.getByRole('button', { name: /သိမ်းဆည်းရန်/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/အခန်းကဏ္ဍအမည် ထည့်ရန် လိုအပ်ပါသည်/i)).toBeInTheDocument()
    })

    expect(mockOnOpenChange).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid allocated minutes', async () => {
    const user = userEvent.setup()
    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    const nameInput = screen.getByLabelText(/Sub-piece Name/i)
    const minutesInput = screen.getByLabelText(/Allocated Minutes/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Valid Name')
    await user.clear(minutesInput)
    await user.type(minutesInput, '0')

    const submitButton = screen.getByRole('button', { name: /သိမ်းဆည်းရန်/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/ခဏထားချိန် မိနစ် 1 နှင့် အထက်ဖြစ်ရပါမည်/i)).toBeInTheDocument()
    })

    expect(mockOnOpenChange).not.toHaveBeenCalled()
  })

  it('cancel button closes the dialog', async () => {
    const user = userEvent.setup()
    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    const cancelButton = screen.getByRole('button', { name: /ပယ်ဖျက်ရန်/i })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
