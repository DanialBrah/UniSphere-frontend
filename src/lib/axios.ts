import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/authStore'
import { queryClient } from './queryClient'

// Separate plain instance for the refresh call — avoids interceptor loops
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

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

    const store = useAuthStore.getState()

    if (!store.refreshToken) {
      store.logout()
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
      const { data: envelope } = await refreshClient.post<{
        success: boolean
        data: {
          accessToken: string
          refreshToken: string
          tokenType: string
          expiresIn: number
          user: Parameters<typeof store.setAuth>[2]
        }
      }>('/auth/refresh', { refreshToken: store.refreshToken })

      const data = envelope.data
      useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user)
      drainQueue(data.accessToken, null)
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      drainQueue(null, refreshError)
      useAuthStore.getState().logout()
      queryClient.clear()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
