import { AxiosError } from 'axios'

interface ApiErrorEnvelope {
  error?: { code?: string; message?: string }
  message?: string | null
}
export interface ParsedApiError {
  status: number | null
  code: string | null
  message: string
  retryAfterSeconds: number | null
}

export function parseApiError(err: unknown): ParsedApiError {
  if (!(err instanceof AxiosError)) {
    return { status: null, code: null, message: 'Something went wrong. Please try again.', retryAfterSeconds: null }
  }

  const envelope = err.response?.data as ApiErrorEnvelope | undefined
  const retryAfterHeader = err.response?.headers['retry-after']
  const retryAfterSeconds = retryAfterHeader != null ? Number(retryAfterHeader) : Number.NaN

  return {
    status: err.response?.status ?? null,
    code: envelope?.error?.code ?? null,
    message: envelope?.error?.message ?? envelope?.message ?? err.message,
    retryAfterSeconds: Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds : null,
  }
}

export function getErrorMessage(err: unknown): string {
  return parseApiError(err).message
}
