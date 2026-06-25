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
  useFocusStore: (selector: (state: { projects: any[]; settings: any }) => any) =>
    mockUseFocusStore(selector),
}))

function mockStore(projects: any[], settings = DEFAULT_SETTINGS) {
  mockUseFocusStore.mockImplementation((selector: (state: { projects: any[]; settings: any }) => any) =>
    selector({ projects, settings })
  )
}

describe('Home (Dashboard)', () => {
  beforeEach(() => {
    mockUseFocusStore.mockClear()
  })

  it('renders the greeting on the dashboard page', () => {
    mockStore([])
    render(<Home />)

    expect(screen.getByText('မင်္ဂလာပါ၊ ဒီနေ့လည်း focus လုပ်ကြမယ်')).toBeInTheDocument()
    expect(screen.getByText('Ready to build your fortress?')).toBeInTheDocument()
  })

  it('shows all zeros when no projects exist', () => {
    mockStore([])
    render(<Home />)

    // Total Projects should be 0 - look for it within the Total Projects card
    const totalProjectsCard = screen.getByText('စုစုပေါင်း ပရောဂျက်များ').closest('[data-slot="card"]') as HTMLElement
    expect(totalProjectsCard).toBeTruthy()
    expect(totalProjectsCard.textContent).toContain('0')

    // DailyFocusGoal should show 0 / 120 with 0% progress (no "Goal reached" at 0%)
    expect(screen.getByText('0 / 120')).toBeInTheDocument()
    expect(screen.getByText('0% achieved')).toBeInTheDocument()

    // StreakCounter should show 0 (look for the card description text)
    const streakCard = screen.getByText('အစဉ်လိုက် focus ရက်များ (Streak)').closest('[data-slot="card"]') as HTMLElement
    expect(streakCard).toBeTruthy()
    expect(streakCard.textContent).toContain('0')

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

    // DailyFocusGoal still shows 0 / 120 (it reads from settings, not project totals)
    expect(screen.getByText('0 / 120')).toBeInTheDocument()

    // StreakCounter shows 0 (default settings)
    const streakCard = screen.getByText('အစဉ်လိုက် focus ရက်များ (Streak)').closest('[data-slot="card"]') as HTMLElement
    expect(streakCard.textContent).toContain('0')

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
    expect(screen.getByText('နေ့စဉ် focus ရည်မှန်းချက်')).toBeInTheDocument()
    expect(screen.getByText('အစဉ်လိုက် focus ရက်များ (Streak)')).toBeInTheDocument()
    expect(screen.getByText('လက်ရှိ အဆင့်')).toBeInTheDocument()
  })
})
