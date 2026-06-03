import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { queryClient } from '../lib/queryClient'
import type { UserProfileResponse, UserRole } from '../features/identity/types/auth'

interface AuthStore {
  accessToken: string | null
  refreshToken: string | null
  user: UserProfileResponse | null
  role: UserRole | null
  isHydrated: boolean
  setAuth: (accessToken: string, refreshToken: string, user: UserProfileResponse) => void
  logout: () => void
  _setHydrated: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,
      isHydrated: false,

      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user, role: user.role }),

      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null, role: null })
        queryClient.clear()
      },

      _setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'unisphere-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._setHydrated()
          if (state.user) state.role = state.user.role
        }
      },
    },
  ),
)
