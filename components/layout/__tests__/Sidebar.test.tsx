import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '../Sidebar'

// Mock usePathname from next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

import { usePathname } from 'next/navigation'

const mockedUsePathname = vi.mocked(usePathname)

describe('Sidebar', () => {
  it('renders all navigation items', () => {
    mockedUsePathname.mockReturnValue('/')
    render(<Sidebar />)

    expect(screen.getByText('ပင်မ')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('ပရောဂျက်များ')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('အချိန်မှတ်')).toBeInTheDocument()
    expect(screen.getByText('Timer')).toBeInTheDocument()
    expect(screen.getByText('ဆက်တင်များ')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('marks the active nav item with primary token classes', () => {
    mockedUsePathname.mockReturnValue('/projects')
    const { container } = render(<Sidebar />)

    const links = container.querySelectorAll('a')
    const projectsLink = Array.from(links).find((a) =>
      a.getAttribute('href') === '/projects'
    )

    expect(projectsLink).toHaveClass('bg-primary/10')
    expect(projectsLink).toHaveClass('text-primary')
  })

  it('marks inactive nav items with muted token classes', () => {
    mockedUsePathname.mockReturnValue('/projects')
    const { container } = render(<Sidebar />)

    const links = container.querySelectorAll('a')
    const dashboardLink = Array.from(links).find((a) =>
      a.getAttribute('href') === '/'
    )

    expect(dashboardLink).toHaveClass('text-muted-foreground')
  })

  it('renders the brand title with text-foreground', () => {
    mockedUsePathname.mockReturnValue('/')
    const { container } = render(<Sidebar />)

    const brandSpan = container.querySelector('span.text-foreground')
    expect(brandSpan).toBeInTheDocument()
    expect(brandSpan).toHaveTextContent('FocusFlow AI')
  })

  it('renders the footer with muted text', () => {
    mockedUsePathname.mockReturnValue('/')
    const { container } = render(<Sidebar />)

    const footer = container.querySelector('div.text-muted-foreground\\/60')
    expect(footer).toBeInTheDocument()
  })
})
