import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user        = useAuthStore((s) => s.user)
  const logout      = useAuthStore((s) => s.logout)
  const isHydrated  = useAuthStore((s) => s.isHydrated)

  return {
    isAuthenticated: !!accessToken,
    user,
    role: user?.role ?? null,   // derived — always in sync with user after page reload
    logout,
    isHydrated,
  }
}
