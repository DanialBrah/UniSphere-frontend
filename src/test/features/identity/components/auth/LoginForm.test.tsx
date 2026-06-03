import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginForm } from '../../../../../features/identity/components/auth/LoginForm'
import type { UseMutationResult } from '@tanstack/react-query'
import type { AuthResponse, LoginRequest } from '../../../../../features/identity/types/auth'

// ── Module mocks ───────────────────────────────────────────────────────────────
vi.mock('../../../../../features/identity/hooks/useLogin', () => ({ useLogin: vi.fn() }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

import { useLogin } from '../../../../../features/identity/hooks/useLogin'

const mockedUseLogin = vi.mocked(useLogin)

// ── Helpers ────────────────────────────────────────────────────────────────────
type LoginMutation = UseMutationResult<AuthResponse, Error, LoginRequest>

function mockLoginWith(overrides: Partial<LoginMutation> = {}) {
  mockedUseLogin.mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
    error: null,
    data: undefined,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    status: 'idle',
    submittedAt: 0,
    reset: vi.fn(),
    ...overrides,
  } as unknown as LoginMutation)
}

function renderForm() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoginWith()
  })

  it('renders the email and password fields', () => {
    renderForm()
    expect(screen.getByPlaceholderText('you@university.edu')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders the Sign in button', () => {
    renderForm()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('renders a link to the register page', () => {
    renderForm()
    expect(screen.getByText('Create one')).toBeInTheDocument()
  })

  it('shows inline validation errors when submitted with empty fields', async () => {
    renderForm()
    fireEvent.click(screen.getByText('Sign in'))
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  it('shows an email format error when a non-email is entered', async () => {
    renderForm()
    fireEvent.change(screen.getByPlaceholderText('you@university.edu'), {
      target: { value: 'notanemail' },
    })
    fireEvent.click(screen.getByText('Sign in'))
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('calls mutate with the correct payload on a valid submit', async () => {
    const mockMutate = vi.fn()
    mockLoginWith({ mutate: mockMutate })
    renderForm()

    fireEvent.change(screen.getByPlaceholderText('you@university.edu'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByText('Sign in'))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('shows a loading spinner and disables the button while pending', () => {
    mockLoginWith({ isPending: true })
    renderForm()
    expect(screen.getByText('Signing in…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('navigates to /forgot-password when Forgot password is clicked', () => {
    renderForm()
    fireEvent.click(screen.getByText('Forgot password?'))
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password')
  })

  it('toggles password visibility when the eye icon button is clicked', () => {
    renderForm()
    const passwordInput = screen.getByPlaceholderText('••••••••')
    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByLabelText('Show password'))
    expect(passwordInput).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByLabelText('Hide password'))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
