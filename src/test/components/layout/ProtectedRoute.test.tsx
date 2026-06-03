import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '../../../components/layout/ProtectedRoute'

// ── Module mocks ───────────────────────────────────────────────────────────────
vi.mock('../../../hooks/useAuth', () => ({ useAuth: vi.fn() }))

import { useAuth } from '../../../hooks/useAuth'

const mockedUseAuth = vi.mocked(useAuth)

// ── Helpers ────────────────────────────────────────────────────────────────────
interface AuthState {
  isAuthenticated: boolean
  isHydrated: boolean
}

function makeRouter({ isAuthenticated, isHydrated }: AuthState) {
  mockedUseAuth.mockReturnValue({
    isAuthenticated,
    isHydrated,
    user: null,
    role: null,
    logout: vi.fn(),
  })

  return createMemoryRouter(
    [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <div>Dashboard Content</div> },
        ],
      },
      { path: '/login', element: <div>Login Page</div> },
    ],
    { initialEntries: ['/dashboard'] },
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the child route when the user is authenticated', () => {
    render(<RouterProvider router={makeRouter({ isAuthenticated: true, isHydrated: true })} />)
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('redirects to /login when the user is not authenticated', () => {
    render(<RouterProvider router={makeRouter({ isAuthenticated: false, isHydrated: true })} />)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
  })

  it('renders nothing (spinner) while the store is still hydrating', () => {
    render(<RouterProvider router={makeRouter({ isAuthenticated: false, isHydrated: false })} />)
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('does not redirect while hydrating even if the user appears unauthenticated', () => {
    render(<RouterProvider router={makeRouter({ isAuthenticated: false, isHydrated: false })} />)
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})
