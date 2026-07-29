import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/authStore'
import { queryClient } from './queryClient'
import { parseApiError } from './utils'
import type { UserProfileResponse } from '../features/identity/types/auth'

// withCredentials is what makes the browser send (and store) the HttpOnly refresh_token
// cookie on cross-origin calls — the SPA and API are different origins even in local dev.
// Separate plain instance for the refresh call — avoids interceptor loops
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  withCredentials: true,
})

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  withCredentials: true,
})

interface RefreshResult {
  accessToken: string
  user: UserProfileResponse
}

/**
 * Exchanges the HttpOnly refresh cookie for a new access token. The cookie is attached and
 * rotated by the browser — there is deliberately no token in the request or response body,
 * so nothing here is reachable by any other script on the page.
 *
 * Shared by the 401 interceptor below and the app-load bootstrap, so both go through exactly
 * one implementation of the refresh contract.
 */
export async function requestTokenRefresh(): Promise<RefreshResult> {
  const { data: envelope } = await refreshClient.post<{
    success: boolean
    data: RefreshResult
  }>('/auth/refresh')
  return envelope.data
}

// ── Request: attach Bearer token ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: 401 → refresh → retry ──────────────────────────────────────────
let isRefreshing = false
type QueueItem = { resolve: (token: string) => void; reject: (err: unknown) => void }
const failedQueue: QueueItem[] = []

function drainQueue(token: string | null, error: unknown) {
  failedQueue.forEach((item) => {
    if (token) item.resolve(token)
    else item.reject(error)
  })
  failedQueue.length = 0
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined
    if (!originalRequest) return Promise.reject(error)
    if (error.response?.status !== 401 || originalRequest._retry) return Promise.reject(error)

    // Skip refresh logic for auth endpoints
    const url = originalRequest.url || ''
    const method = originalRequest.method?.toUpperCase()
    if (method === 'POST' && (url.endsWith('/auth/login') || url.startsWith('/auth/register'))) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        originalRequest._retry = true
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { accessToken, user } = await requestTokenRefresh()
      useAuthStore.getState().setAuth(accessToken, user)
      drainQueue(accessToken, null)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      drainQueue(null, refreshError)
      // A rate-limited refresh call is not an invalid session — don't punish
      // the user with a forced logout over a transient 429.
      if (parseApiError(refreshError).status !== 429) {
        useAuthStore.getState().logout()
        queryClient.clear()
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
