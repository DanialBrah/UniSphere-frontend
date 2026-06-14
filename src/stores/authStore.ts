import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { queryClient } from '../lib/queryClient'
import type { UserProfileResponse } from '../features/identity/types/auth'

interface AuthStore {
  accessToken: string | null
  refreshToken: string | null
  user: UserProfileResponse | null
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
      isHydrated: false,

      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),

      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null })
        queryClient.clear()
      },

      _setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'unisphere-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // state is the live store snapshot (includes all actions)
        // Optional chaining handles the rare error/undefined case
        state?._setHydrated?.()
      },
    },
  ),
)
