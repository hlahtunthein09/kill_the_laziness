import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddSubPieceButton } from '../AddSubPieceButton'

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        getProjectById: vi.fn(() => ({ id: 'project-1', subPieces: [] })),
        addSubPiece: vi.fn(),
        getRemainingBudgetSeconds: vi.fn(() => 3600),
      }
      return selector ? selector(state) : state
    }),
    {
      getState: vi.fn(() => ({
        getProjectById: vi.fn(() => ({ id: 'project-1', subPieces: [] })),
        addSubPiece: vi.fn(),
        getRemainingBudgetSeconds: vi.fn(() => 3600),
      })),
    }
  ),
}))

describe('AddSubPieceButton', () => {
  it('renders the button with correct label', () => {
    render(<AddSubPieceButton projectId="project-1" />)

    const button = screen.getByRole('button', { name: /Add Sub-piece/i })
    expect(button).toBeInTheDocument()
  })

  it('opens the SubPieceForm dialog when clicked', async () => {
    const user = userEvent.setup()
    render(<AddSubPieceButton projectId="project-1" />)

    const button = screen.getByRole('button', { name: /Add Sub-piece/i })
    await user.click(button)

    // The dialog title from SubPieceForm should be visible
    expect(screen.getByText(/Add New Sub-piece/i)).toBeInTheDocument()
  })
})
