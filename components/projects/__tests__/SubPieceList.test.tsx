import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubPieceList } from '../SubPieceList'
import type { SubPiece } from '@/lib/types'

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

describe('SubPieceList', () => {
  it('shows empty state when no sub-pieces', () => {
    render(<SubPieceList subPieces={[]} projectId="proj-1" />)

    expect(screen.getByText(/အခန်းကဏ္ဍများ မရှိသေးပါ/i)).toBeInTheDocument()
    expect(screen.getByText(/No sub-pieces yet/i)).toBeInTheDocument()
  })

  it('renders sub-pieces with name and allocated minutes', () => {
    const subPieces = [
      createMockSubPiece({ id: 'sp-1', name: 'Design UI', allocatedMinutes: 30 }),
      createMockSubPiece({ id: 'sp-2', name: 'Write Tests', allocatedMinutes: 45, status: 'running' }),
    ]

    render(<SubPieceList subPieces={subPieces} projectId="proj-1" />)

    expect(screen.getByText('Design UI')).toBeInTheDocument()
    expect(screen.getByText('Write Tests')).toBeInTheDocument()

    // Check minutes are rendered (with Burmese "မိနစ်")
    expect(screen.getByText(/30 မိနစ်/)).toBeInTheDocument()
    expect(screen.getByText(/45 မိနစ်/)).toBeInTheDocument()
  })

  it('renders correct number of sub-piece cards', () => {
    const subPieces = [
      createMockSubPiece({ id: 'sp-1', name: 'Alpha' }),
      createMockSubPiece({ id: 'sp-2', name: 'Beta' }),
      createMockSubPiece({ id: 'sp-3', name: 'Gamma' }),
    ]

    render(<SubPieceList subPieces={subPieces} projectId="proj-1" />)

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })
})
