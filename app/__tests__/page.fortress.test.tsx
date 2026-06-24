import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../page'

const mockUseFocusStore = vi.fn()

const DEFAULT_SETTINGS = {
  todayFocusSeconds: 0,
  dailyFocusGoalMinutes: 120,
  forbiddenUrls: [],
  strictMode: false,
  notifications: true,
  theme: 'light',
  currentStreak: 0,
  longestStreak: 0,
}

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: (selector: (state: { projects: any[]; settings: any; activeProjectId: string | null }) => any) =>
    mockUseFocusStore(selector),
}))

function mockStore(projects: any[], activeProjectId: string | null = null, settings = DEFAULT_SETTINGS) {
  mockUseFocusStore.mockImplementation((selector: (state: { projects: any[]; settings: any; activeProjectId: string | null }) => any) =>
    selector({ projects, settings, activeProjectId })
  )
}

describe('Home Dashboard — Fortress Card', () => {
  beforeEach(() => {
    mockUseFocusStore.mockClear()
  })

  it('renders the Fortress card on the dashboard', () => {
    mockStore([])
    render(<Home />)

    expect(screen.getByText('ခံတပ် (Fortress)')).toBeInTheDocument()
  })

  it('shows active project fortress when a project is active', () => {
    mockStore(
      [
        {
          id: 'proj-1',
          name: 'Project A',
          totalTimeSeconds: 0,
          xp: 100,
          fortressLevel: 3,
          fortressHealth: 80,
        },
      ],
      'proj-1'
    )
    render(<Home />)

    const fortressCard = screen.getByText('ခံတပ် (Fortress)').closest('[data-slot="card"]') as HTMLElement
    expect(fortressCard).toBeTruthy()
    expect(fortressCard.textContent).toContain('အဆင့် 3 (Level 3)')
  })

  it('falls back to first project when none is active', () => {
    mockStore(
      [
        {
          id: 'proj-1',
          name: 'Project A',
          totalTimeSeconds: 0,
          xp: 50,
          fortressLevel: 2,
          fortressHealth: 60,
        },
        {
          id: 'proj-2',
          name: 'Project B',
          totalTimeSeconds: 0,
          xp: 200,
          fortressLevel: 5,
          fortressHealth: 90,
        },
      ],
      null
    )
    render(<Home />)

    const fortressCard = screen.getByText('ခံတပ် (Fortress)').closest('[data-slot="card"]') as HTMLElement
    expect(fortressCard).toBeTruthy()
    // Should show first project (proj-1) fortress level 2
    expect(fortressCard.textContent).toContain('အဆင့် 2 (Level 2)')
  })

  it('shows empty state when no projects exist', () => {
    mockStore([], null)
    render(<Home />)

    const fortressCard = screen.getByText('ခံတပ် (Fortress)').closest('[data-slot="card"]') as HTMLElement
    expect(fortressCard).toBeTruthy()
    expect(fortressCard.textContent).toContain('ပရောဂျက်မရှိသေးပါ')
  })
})
