import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '../Header'

describe('Header', () => {
  it('does not render the dashboard greeting', () => {
    render(<Header />)

    expect(screen.queryByText('မင်္ဂလာပါ၊ ဒီနေ့လည်း focus လုပ်ကြမယ်')).not.toBeInTheDocument()
    expect(screen.queryByText('Ready to build your fortress?')).not.toBeInTheDocument()
  })

  it('renders the logo/title', () => {
    render(<Header />)
    expect(screen.getByText('FocusFlow AI')).toBeInTheDocument()
  })

  it('renders the streak counter', () => {
    render(<Header />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders the title with text-foreground', () => {
    const { container } = render(<Header />)
    const title = container.querySelector('span.text-foreground')
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('FocusFlow AI')
  })

  it('does not use hardcoded light-only classes in the streak badge', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()

    const headerHtml = header!.innerHTML
    expect(headerHtml).not.toContain('bg-white')
    expect(headerHtml).not.toContain('text-stone-900')
  })
})
