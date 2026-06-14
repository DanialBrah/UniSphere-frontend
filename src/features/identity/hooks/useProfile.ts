import { useQuery } from '@tanstack/react-query'
import { userApi } from '../api/userApi'
import { useAuth } from '../../../hooks/useAuth'
import { useAuthStore } from '../../../stores/authStore'

export function useProfile() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: userApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    initialData: useAuthStore.getState().user ?? undefined,
  })
}
