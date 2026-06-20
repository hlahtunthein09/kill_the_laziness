import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectCard } from '../ProjectCard'
import type { Project } from '@/lib/types'

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    name: 'Test Project',
    description: 'A test description',
    color: 'mint',
    createdAt: Date.now(),
    totalTimeSeconds: 3661, // 1h 1m 1s
    targetTimeSeconds: 7200, // 2h
    status: 'idle',
    fortressLevel: 1,
    fortressHealth: 100,
    xp: 0,
    subPieces: [],
    ...overrides,
  }
}

describe('ProjectCard', () => {
  it('shows project name', () => {
    render(<ProjectCard project={createMockProject()} />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('shows description when provided', () => {
    render(<ProjectCard project={createMockProject()} />)

    expect(screen.getByText('A test description')).toBeInTheDocument()
  })

  it('does not show description when empty', () => {
    render(<ProjectCard project={createMockProject({ description: '' })} />)

    expect(screen.queryByText('A test description')).not.toBeInTheDocument()
  })

  it('shows progress bar', () => {
    render(<ProjectCard project={createMockProject()} />)

    // Progress should be ~51% (3661/7200 * 100)
    expect(screen.getByText(/51%/)).toBeInTheDocument()
  })

  it('shows formatted total time', () => {
    render(<ProjectCard project={createMockProject()} />)

    // 3661 seconds = 1h 1m (seconds only shown when hours=0)
    // The time appears in the footer as "စုစုပေါင်း အချိန်: 1h 1m (Total time: 1h 1m)"
    const footer = screen.getByText(/စုစုပေါင်း အချိန်/i)
    expect(footer).toBeInTheDocument()
    expect(footer.textContent).toMatch(/1h 1m/)
  })

  it('shows status badge', () => {
    render(<ProjectCard project={createMockProject()} />)

    expect(screen.getByText(/အားနေသည်/)).toBeInTheDocument()
    expect(screen.getByText(/Idle/)).toBeInTheDocument()
  })

  it('shows different color based on project color', () => {
    const { container: mintContainer } = render(
      <ProjectCard project={createMockProject({ color: 'mint' })} />
    )
    expect(mintContainer.querySelector('.bg-teal-400')).toBeInTheDocument()

    const { container: oceanContainer } = render(
      <ProjectCard project={createMockProject({ color: 'ocean' })} />
    )
    expect(oceanContainer.querySelector('.bg-sky-400')).toBeInTheDocument()
  })
})
