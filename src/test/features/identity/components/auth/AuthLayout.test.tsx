import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthLayout } from '../../../../../features/identity/components/auth/AuthLayout'

// ── Module mocks ───────────────────────────────────────────────────────────────
vi.mock('../../../../../stores/themeStore', () => ({
  useThemeStore: vi.fn(),
}))

import { useThemeStore } from '../../../../../stores/themeStore'

const mockToggle = vi.fn()
const mockedUseThemeStore = vi.mocked(useThemeStore)

// ── Helpers ────────────────────────────────────────────────────────────────────
function renderLayout(title = 'Test Title', subtitle = 'Test subtitle') {
  return render(
    <MemoryRouter>
      <AuthLayout title={title} subtitle={subtitle}>
        <div data-testid="child-content">child</div>
      </AuthLayout>
    </MemoryRouter>,
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('AuthLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseThemeStore.mockReturnValue({ isDark: false, toggle: mockToggle })
  })

  it('renders the provided title', () => {
    renderLayout('Welcome back', 'Sign in to continue')
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders the provided subtitle', () => {
    renderLayout('Welcome back', 'Sign in to continue')
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument()
  })

  it('renders children inside the card', () => {
    renderLayout()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('renders the UniSphere brand name', () => {
    renderLayout()
    expect(screen.getByText('UniSphere')).toBeInTheDocument()
  })

  it('renders a theme toggle button', () => {
    renderLayout()
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
  })

  it('calls toggle when the theme button is clicked', () => {
    renderLayout()
    fireEvent.click(screen.getByLabelText('Toggle theme'))
    expect(mockToggle).toHaveBeenCalledOnce()
  })

  it('still renders the theme toggle button in dark mode', () => {
    mockedUseThemeStore.mockReturnValue({ isDark: true, toggle: mockToggle })
    renderLayout()
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
  })
})
