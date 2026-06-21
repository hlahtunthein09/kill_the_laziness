import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../page'

const mockUseFocusStore = vi.fn()

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: (selector: (state: { projects: any[] }) => any) =>
    mockUseFocusStore(selector),
}))

function mockStore(projects: any[]) {
  mockUseFocusStore.mockImplementation((selector: (state: { projects: any[] }) => any) =>
    selector({ projects })
  )
}

describe('Home (Dashboard)', () => {
  beforeEach(() => {
    mockUseFocusStore.mockClear()
  })

  it('shows all zeros when no projects exist', () => {
    mockStore([])
    render(<Home />)

    // Total Projects should be 0 - look for it within the Total Projects card
    const totalProjectsCard = screen.getByText('စုစုပေါင်း ပရောဂျက်များ').closest('[data-slot="card"]') as HTMLElement
    expect(totalProjectsCard).toBeTruthy()
    expect(totalProjectsCard.textContent).toContain('0')

    // Focus time should show 0 မိနစ်
    const focusTimeCard = screen.getByText('ယနေ့ focus အချိန်').closest('[data-slot="card"]') as HTMLElement
    expect(focusTimeCard).toBeTruthy()
    expect(focusTimeCard.textContent).toContain('0')
    expect(focusTimeCard.textContent).toContain('မိနစ်')

    // Current Level should be 1 (default level)
    const levelCard = screen.getByText('လက်ရှိ အဆင့်').closest('[data-slot="card"]') as HTMLElement
    expect(levelCard).toBeTruthy()
    expect(levelCard.textContent).toContain('1')
  })

  it('shows correct stats when projects exist', () => {
    mockStore([
      {
        id: 'proj-1',
        name: 'Project A',
        totalTimeSeconds: 3661, // 61 minutes + 1 second
        xp: 250,
      },
      {
        id: 'proj-2',
        name: 'Project B',
        totalTimeSeconds: 120, // 2 minutes
        xp: 100,
      },
    ])
    render(<Home />)

    // Total Projects = 2
    const totalProjectsCard = screen.getByText('စုစုပေါင်း ပရောဂျက်များ').closest('[data-slot="card"]') as HTMLElement
    expect(totalProjectsCard.textContent).toContain('2')

    // Today Focus Minutes = floor((3661 + 120) / 60) = floor(63.01) = 63
    const focusTimeCard = screen.getByText('ယနေ့ focus အချိန်').closest('[data-slot="card"]') as HTMLElement
    expect(focusTimeCard.textContent).toContain('63')

    // Total XP = 250 + 100 = 350 -> Level 2 (threshold 200)
    const levelCard = screen.getByText('လက်ရှိ အဆင့်').closest('[data-slot="card"]') as HTMLElement
    expect(levelCard.textContent).toContain('2')
  })

  it('shows level 3 when total XP crosses threshold', () => {
    mockStore([
      {
        id: 'proj-1',
        name: 'Project C',
        totalTimeSeconds: 0,
        xp: 550,
      },
    ])
    render(<Home />)

    // Total XP = 550 -> Level 3 (threshold 500)
    const levelCard = screen.getByText('လက်ရှိ အဆင့်').closest('[data-slot="card"]') as HTMLElement
    expect(levelCard.textContent).toContain('3')
  })

  it('renders Burmese labels unchanged', () => {
    mockStore([])
    render(<Home />)

    expect(screen.getByText('စုစုပေါင်း ပရောဂျက်များ')).toBeInTheDocument()
    expect(screen.getByText('ယနေ့ focus အချိန်')).toBeInTheDocument()
    expect(screen.getByText('လက်ရှိ အဆင့်')).toBeInTheDocument()
  })
})
