import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FortressSvg from '../FortressSvg'

describe('FortressSvg', () => {
  it('renders level 1 fortress with 1 tower', () => {
    const { container } = render(<FortressSvg level={1} health={80} />)
    const towers = container.querySelectorAll('rect[fill="#14b8a6"]')
    // 1 tower + 1 main body = 2 rects with fill="#14b8a6" (door is #0d9488)
    expect(towers.length).toBe(2)
  })

  it('renders higher level fortress with more towers', () => {
    const { container: c2 } = render(<FortressSvg level={2} health={80} />)
    const towers2 = c2.querySelectorAll('rect[fill="#14b8a6"]')
    expect(towers2.length).toBe(3)

    const { container: c4 } = render(<FortressSvg level={4} health={80} />)
    const towers4 = c4.querySelectorAll('rect[fill="#14b8a6"]')
    expect(towers4.length).toBe(4)

    // flag should appear at level 4+
    const flag = c4.querySelector('polygon[fill="#fde68a"]')
    expect(flag).toBeTruthy()
  })

  it('health bar width matches health percent', () => {
    const { container: c30 } = render(<FortressSvg level={1} health={30} />)
    const bar30 = c30.querySelector('rect[fill="#f59e0b"]')
    expect(bar30).toBeTruthy()
    expect(bar30?.getAttribute('width')).toBe(`${120 * 0.9 * 0.3}`)

    const { container: c70 } = render(<FortressSvg level={1} health={70} />)
    const bar70 = c70.querySelector('rect[fill="#34d399"]')
    expect(bar70).toBeTruthy()
    expect(bar70?.getAttribute('width')).toBe(`${120 * 0.9 * 0.7}`)
  })

  it('shows Burmese/English level label', () => {
    render(<FortressSvg level={3} health={80} />)
    expect(screen.getByText('အဆင့် 3 (Level 3)')).toBeInTheDocument()
  })
})
