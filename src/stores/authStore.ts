import { create } from 'zustand'
import { queryClient } from '../lib/queryClient'
import type { UserProfileResponse } from '../features/identity/types/auth'

/**
 * One-time cleanup of credentials written by earlier builds of this app.
 *
 * Until Jun 2026 the store persisted the access token to localStorage (zustand's `persist`
 * default); a later build switched to sessionStorage. Neither is used now — the access token
 * lives in memory only and the refresh token in an HttpOnly cookie — but `persist` never removes
 * entries from a backend it has stopped writing to. Those orphans would otherwise sit in every
 * existing user's browser indefinitely, untouched by logout, with localStorage never expiring.
 */
const LEGACY_PERSIST_KEY = 'unisphere-auth'
try {
  localStorage.removeItem(LEGACY_PERSIST_KEY)
  sessionStorage.removeItem(LEGACY_PERSIST_KEY)
} catch {
  // Storage access throws when cookies/storage are blocked — nothing to clean up in that case.
}

interface AuthStore {
  accessToken: string | null
  user: UserProfileResponse | null
  /** True once the app-load silent re-auth has settled, either way. */
  isHydrated: boolean
  setAuth: (accessToken: string, user: UserProfileResponse) => void
  logout: () => void
  _setHydrated: () => void
}

/**
 * Deliberately NOT persisted. The access token is held in memory only, so it dies with the tab
 * and is never readable by another script via Web Storage. Sessions survive reloads through the
 * HttpOnly refresh cookie instead — see `bootstrapAuth`.
 */
export const useAuthStore = create<AuthStore>()((set) => ({
  accessToken: null,
  user: null,
  isHydrated: false,

  setAuth: (accessToken, user) => set({ accessToken, user }),

  logout: () => {
    set({ accessToken: null, user: null })
    queryClient.clear()
  },

  _setHydrated: () => set({ isHydrated: true }),
}))
