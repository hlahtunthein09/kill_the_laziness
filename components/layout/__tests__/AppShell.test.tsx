import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell } from '../AppShell'

// Mock usePathname so Sidebar (rendered inside AppShell) works
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}))

describe('AppShell', () => {
  it('renders the sidebar with bg-sidebar class', () => {
    const { container } = render(
      <AppShell>
        <div data-testid="child">Child Content</div>
      </AppShell>
    )

    const sidebar = container.querySelector('aside')
    expect(sidebar).toHaveClass('bg-sidebar')
  })

  it('renders the header with bg-background class', () => {
    const { container } = render(
      <AppShell>
        <div>Child Content</div>
      </AppShell>
    )

    const header = container.querySelector('header')
    expect(header).toHaveClass('bg-background')
  })

  it('renders the outer wrapper with bg-background class', () => {
    const { container } = render(
      <AppShell>
        <div>Child Content</div>
      </AppShell>
    )

    const wrapper = container.querySelector('div.flex.h-screen')
    expect(wrapper).toHaveClass('bg-background')
  })

  it('renders children inside the scrollable content area', () => {
    render(
      <AppShell>
        <div data-testid="child">Child Content</div>
      </AppShell>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('renders a sidebar toggle button', () => {
    render(
      <AppShell>
        <div>Child Content</div>
      </AppShell>
    )

    expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument()
  })
})
