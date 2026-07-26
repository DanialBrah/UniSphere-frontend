import { QueryClient } from '@tanstack/react-query'
import { parseApiError } from './utils'

const NON_RETRYABLE_STATUSES = new Set([401, 403, 404, 429])

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        const { status } = parseApiError(error)
        if (status !== null && NON_RETRYABLE_STATUSES.has(status)) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
