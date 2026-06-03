import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ForgotPasswordForm } from '../../../../../features/identity/components/auth/ForgotPasswordForm'
import type { UseMutationResult } from '@tanstack/react-query'
import type { ForgotPasswordRequest } from '../../../../../features/identity/types/auth'

// ── Module mocks ───────────────────────────────────────────────────────────────
vi.mock('../../../../../features/identity/hooks/useForgotPassword', () => ({
  useForgotPassword: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { useForgotPassword } from '../../../../../features/identity/hooks/useForgotPassword'

const mockedUseForgotPassword = vi.mocked(useForgotPassword)

// ── Helpers ────────────────────────────────────────────────────────────────────
type ForgotMutation = UseMutationResult<void, Error, ForgotPasswordRequest>

function mockMutationWith(overrides: Partial<ForgotMutation> = {}) {
  mockedUseForgotPassword.mockReturnValue({
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
  } as unknown as ForgotMutation)
}

function renderForm() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ForgotPasswordForm />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMutationWith()
  })

  it('renders the email field', () => {
    renderForm()
    expect(screen.getByPlaceholderText('you@university.edu')).toBeInTheDocument()
  })

  it('renders the send reset link button', () => {
    renderForm()
    expect(screen.getByText('Send reset link')).toBeInTheDocument()
  })

  it('shows validation error on empty submit', async () => {
    renderForm()
    fireEvent.click(screen.getByText('Send reset link'))
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  it('transitions to success state when mutation succeeds', async () => {
    const mockMutate = vi.fn().mockImplementation((_data: unknown, opts: { onSuccess?: () => void }) => {
      opts?.onSuccess?.()
    })
    mockMutationWith({ mutate: mockMutate })
    renderForm()

    fireEvent.change(screen.getByPlaceholderText('you@university.edu'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.click(screen.getByText('Send reset link'))

    await waitFor(() => {
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument()
    })
  })

  it('shows a "Back to sign in" link in the success state', async () => {
    const mockMutate = vi.fn().mockImplementation((_data: unknown, opts: { onSuccess?: () => void }) => {
      opts?.onSuccess?.()
    })
    mockMutationWith({ mutate: mockMutate })
    renderForm()

    fireEvent.change(screen.getByPlaceholderText('you@university.edu'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.click(screen.getByText('Send reset link'))

    await waitFor(() => {
      expect(screen.getByText('Back to sign in')).toBeInTheDocument()
    })
  })

  it('disables the button and shows a spinner while pending', () => {
    mockMutationWith({ isPending: true })
    renderForm()
    expect(screen.getByText('Sending…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
  })
})
