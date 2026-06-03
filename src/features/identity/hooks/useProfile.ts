import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuth } from '../../../hooks/useAuth'
import { useAuthStore } from '../../../stores/authStore'

export function useProfile() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    initialData: useAuthStore.getState().user ?? undefined,
  })
}
