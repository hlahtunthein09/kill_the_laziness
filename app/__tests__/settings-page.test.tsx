import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SettingsPage from '../settings/page'

describe('SettingsPage', () => {
  it('renders the Burmese title with English subtitle', () => {
    render(<SettingsPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('ဆက်တင်များ')
    expect(heading.textContent).toContain('Settings')
  })

  it('renders all section labels in Burmese', () => {
    render(<SettingsPage />)
    expect(screen.getByText('အထူးသတိပြုရန် မုဒ်')).toBeInTheDocument()
    expect(screen.getByText('တားမြစ်ထားသော ဝဘ်ဆိုက်များ')).toBeInTheDocument()
    expect(screen.getByText('အသိပေးချက်များ')).toBeInTheDocument()
    expect(screen.getByText('အပြင်အဆင်')).toBeInTheDocument()
    expect(screen.getByText('အာရုံစားသမျှမှတ်တမ်း')).toBeInTheDocument()
  })

  it('renders all section labels in English', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Strict Mode')).toBeInTheDocument()
    expect(screen.getByText('Forbidden URLs')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Distraction Log')).toBeInTheDocument()
  })
})
