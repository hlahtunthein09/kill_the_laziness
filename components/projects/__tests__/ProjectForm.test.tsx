import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectForm } from '../ProjectForm'
import { useFocusStore } from '@/lib/store/useFocusStore'
import { useRouter } from 'next/navigation'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}))

const mockSetActiveProject = vi.fn()
const mockAddProject = vi.fn((project) => ({ id: 'new-id', ...project }))

vi.mock('@/lib/store/useFocusStore', () => {
  const useFocusStore = vi.fn((selector: any) => {
    if (typeof selector === 'function') {
      return selector({ setActiveProject: mockSetActiveProject })
    }
    return undefined
  }) as any

  useFocusStore.getState = vi.fn(() => ({
    addProject: mockAddProject,
  }))

  return { useFocusStore }
})

describe('ProjectForm', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAddProject.mockReturnValue({ id: 'new-id' })
  })

  it('renders dialog content when open', () => {
    render(<ProjectForm open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText(/ပရောဂျက်အသစ် ထည့်ရန်/i)).toBeInTheDocument()
    expect(screen.getByText(/Add New Project/i)).toBeInTheDocument()
  })

  it('does not render dialog content when closed', () => {
    render(<ProjectForm open={false} onOpenChange={mockOnOpenChange} />)

    expect(screen.queryByText(/ပရောဂျက်အသစ် ထည့်ရန်/i)).not.toBeInTheDocument()
  })

  it('inputs accept values', async () => {
    const user = userEvent.setup()
    render(<ProjectForm open={true} onOpenChange={mockOnOpenChange} />)

    // Query by ID to avoid label text collisions with dialog title
    const nameInput = screen.getByLabelText(/Project Name/i)
    const descInput = screen.getByLabelText(/Description/i)
    const hoursInput = screen.getByLabelText(/Target Hours/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'My Test Project')
    await user.type(descInput, 'A description here')
    await user.clear(hoursInput)
    await user.type(hoursInput, '5')

    expect(nameInput).toHaveValue('My Test Project')
    expect(descInput).toHaveValue('A description here')
    expect(hoursInput).toHaveValue(5)
  })

  it('submit button calls addProject with correct data', async () => {
    const user = userEvent.setup()

    render(<ProjectForm open={true} onOpenChange={mockOnOpenChange} />)

    const nameInput = screen.getByLabelText(/Project Name/i)
    const hoursInput = screen.getByLabelText(/Target Hours/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Test Project')
    await user.clear(hoursInput)
    await user.type(hoursInput, '2')

    const submitButton = screen.getByRole('button', { name: /သိမ်းဆည်းရန်/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockAddProject).toHaveBeenCalledTimes(1)
    })

    expect(mockAddProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Project',
        targetTimeSeconds: 7200, // 2 hours * 3600
      })
    )
  })

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup()
    render(<ProjectForm open={true} onOpenChange={mockOnOpenChange} />)

    const nameInput = screen.getByLabelText(/Project Name/i)
    await user.clear(nameInput)

    const submitButton = screen.getByRole('button', { name: /သိမ်းဆည်းရန်/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/ပရောဂျက်အမည် ထည့်ရန် လိုအပ်ပါသည်/i)).toBeInTheDocument()
    })

    expect(mockOnOpenChange).not.toHaveBeenCalled()
  })

  it('cancel button closes the dialog', async () => {
    const user = userEvent.setup()
    render(<ProjectForm open={true} onOpenChange={mockOnOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: /ပယ်ဖျက်ရန်/i })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('navigates to timer and sets active project after successful save', async () => {
    const user = userEvent.setup()

    render(<ProjectForm open={true} onOpenChange={mockOnOpenChange} />)

    const nameInput = screen.getByLabelText(/Project Name/i)
    const hoursInput = screen.getByLabelText(/Target Hours/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Nav Project')
    await user.clear(hoursInput)
    await user.type(hoursInput, '3')

    const submitButton = screen.getByRole('button', { name: /သိမ်းဆည်းရန်/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockAddProject).toHaveBeenCalledTimes(1)
    })

    expect(mockSetActiveProject).toHaveBeenCalledWith('new-id')
    expect(mockPush).toHaveBeenCalledWith('/projects?scrollTo=new-id')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
