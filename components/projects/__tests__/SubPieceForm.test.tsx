import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubPieceForm } from '../SubPieceForm'

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        getProjectById: vi.fn(() => ({ id: 'project-1', subPieces: [] })),
        addSubPiece: vi.fn((subPiece) => ({ id: 'test-subpiece-id', ...subPiece })),
        getRemainingBudgetSeconds: vi.fn(() => 3600),
      }
      return selector ? selector(state) : state
    }),
    {
      getState: vi.fn(() => ({
        getProjectById: vi.fn(() => ({ id: 'project-1', subPieces: [] })),
        addSubPiece: vi.fn((subPiece) => ({ id: 'test-subpiece-id', ...subPiece })),
        getRemainingBudgetSeconds: vi.fn(() => 3600),
      })),
    }
  ),
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
    const mockGetRemainingBudgetSeconds = vi.fn(() => 3600)

    const mockedModule = await import('@/lib/store/useFocusStore')
    const newState = {
      getProjectById: mockGetProjectById,
      addSubPiece: mockAddSubPiece,
      getRemainingBudgetSeconds: mockGetRemainingBudgetSeconds,
    }
    // @ts-expect-error - mocking internal
    mockedModule.useFocusStore.getState = vi.fn(() => newState)
    // @ts-expect-error - mocking internal
    mockedModule.useFocusStore.mockImplementation((selector) => (selector ? selector(newState) : newState))

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

  it('calls onSubPieceAdded callback with the new sub-piece id', async () => {
    const user = userEvent.setup()
    const mockOnSubPieceAdded = vi.fn()
    const mockAddSubPiece = vi.fn(() => ({ id: 'new-subpiece-id' }))
    const mockGetProjectById = vi.fn(() => ({ id: projectId, subPieces: [] }))
    const mockGetRemainingBudgetSeconds = vi.fn(() => 3600)

    const mockedModule = await import('@/lib/store/useFocusStore')
    const newState = {
      getProjectById: mockGetProjectById,
      addSubPiece: mockAddSubPiece,
      getRemainingBudgetSeconds: mockGetRemainingBudgetSeconds,
    }
    // @ts-expect-error - mocking internal
    mockedModule.useFocusStore.getState = vi.fn(() => newState)
    // @ts-expect-error - mocking internal
    mockedModule.useFocusStore.mockImplementation((selector) => (selector ? selector(newState) : newState))

    render(
      <SubPieceForm
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        onSubPieceAdded={mockOnSubPieceAdded}
      />
    )

    const nameInput = screen.getByLabelText(/Sub-piece Name/i)
    const minutesInput = screen.getByLabelText(/Allocated Minutes/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Design API')
    await user.clear(minutesInput)
    await user.type(minutesInput, '45')

    const submitButton = screen.getByRole('button', { name: /သိမ်းဆည်းရန်/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubPieceAdded).toHaveBeenCalledWith('new-subpiece-id')
    })
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
      expect(screen.getByText(/သတ်မှတ်အချိန် ၁မိနစ်အထက်ဖြစ်ရပါမယ်/i)).toBeInTheDocument()
    })

    expect(mockOnOpenChange).not.toHaveBeenCalled()
  })

  it('rejects negative allocated minutes', async () => {
    const user = userEvent.setup()
    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    const minutesInput = screen.getByLabelText(/Allocated Minutes/i) as HTMLInputElement

    await user.clear(minutesInput)
    await user.type(minutesInput, '-5')

    // The minus key is blocked, so the value should be 5 (valid), not -5
    expect(minutesInput.value).toBe('5')
  })

  it('helper line renders remaining minutes', () => {
    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    expect(screen.getByText(/Project အတွက်ကျန်ရှိသော အချိန်: 60 မိနစ်/i)).toBeInTheDocument()
  })

  it('over-budget blocks Save and shows error', async () => {
    const user = userEvent.setup()
    const mockAddSubPiece = vi.fn(() => ({ id: 'new-subpiece-id' }))
    const mockGetProjectById = vi.fn(() => ({ id: projectId, subPieces: [] }))
    const mockGetRemainingBudgetSeconds = vi.fn(() => 3600) // 60 minutes remaining

    const mockedModule = await import('@/lib/store/useFocusStore')
    const newState = {
      getProjectById: mockGetProjectById,
      addSubPiece: mockAddSubPiece,
      getRemainingBudgetSeconds: mockGetRemainingBudgetSeconds,
    }
    // @ts-expect-error - mocking internal
    mockedModule.useFocusStore.getState = vi.fn(() => newState)
    // @ts-expect-error - mocking internal
    mockedModule.useFocusStore.mockImplementation((selector) => (selector ? selector(newState) : newState))

    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    const nameInput = screen.getByLabelText(/Sub-piece Name/i)
    const minutesInput = screen.getByLabelText(/Allocated Minutes/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Over Budget Task')
    await user.clear(minutesInput)
    await user.type(minutesInput, '90')

    const submitButton = screen.getByRole('button', { name: /သိမ်းဆည်းရန်/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/သတ်မှတ်ထားသောအချိန်ထက်ကျော်လွန်နေပါသည်/i)).toBeInTheDocument()
    })

    expect(mockAddSubPiece).not.toHaveBeenCalled()
    expect(mockOnOpenChange).not.toHaveBeenCalled()
  })

  it('full budget disables Save button', async () => {
    const user = userEvent.setup()
    const mockAddSubPiece = vi.fn(() => ({ id: 'new-subpiece-id' }))
    const mockGetProjectById = vi.fn(() => ({
      id: projectId,
      subPieces: [{ id: 'sp1', allocatedMinutes: 60 }],
    }))
    const mockGetRemainingBudgetSeconds = vi.fn(() => 0) // 0 minutes remaining

    const mockedModule = await import('@/lib/store/useFocusStore')
    const newState = {
      getProjectById: mockGetProjectById,
      addSubPiece: mockAddSubPiece,
      getRemainingBudgetSeconds: mockGetRemainingBudgetSeconds,
    }
    // @ts-expect-error - mocking internal
    mockedModule.useFocusStore.getState = vi.fn(() => newState)
    // @ts-expect-error - mocking internal
    mockedModule.useFocusStore.mockImplementation((selector) => (selector ? selector(newState) : newState))

    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    const submitButton = screen.getByRole('button', { name: /သိမ်းဆည်းရန်/i })
    expect(submitButton).toBeDisabled()
  })

  it('cancel button closes the dialog', async () => {
    const user = userEvent.setup()
    render(<SubPieceForm open={true} onOpenChange={mockOnOpenChange} projectId={projectId} />)

    const cancelButton = screen.getByRole('button', { name: /ပယ်ဖျက်ရန်/i })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
