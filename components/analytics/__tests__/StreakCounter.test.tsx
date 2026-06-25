import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreakCounter } from '../StreakCounter'

const mockUseFocusStore = vi.fn()

vi.mock('@/lib/store/useFocusStore', () => ({
  useFocusStore: (selector: (state: { settings: any }) => any) =>
    mockUseFocusStore(selector),
}))

function mockStore(currentStreak: number, longestStreak: number) {
  mockUseFocusStore.mockImplementation((selector: (state: { settings: any }) => any) =>
    selector({ settings: { currentStreak, longestStreak } })
  )
}

describe('StreakCounter', () => {
  it('renders current streak number', () => {
    mockStore(5, 10)
    render(<StreakCounter />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders longest streak subtitle', () => {
    mockStore(5, 10)
    render(<StreakCounter />)

    expect(screen.getByText('စံချိန်: 10 ရက် (Best: 10)')).toBeInTheDocument()
  })

  it('renders 0 when no streak', () => {
    mockStore(0, 0)
    render(<StreakCounter />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('စံချိန်: 0 ရက် (Best: 0)')).toBeInTheDocument()
  })

  it('renders Burmese title', () => {
    mockStore(3, 7)
    render(<StreakCounter />)

    expect(screen.getByText('အစဉ်လိုက် focus ရက်များ (Streak)')).toBeInTheDocument()
  })
})
