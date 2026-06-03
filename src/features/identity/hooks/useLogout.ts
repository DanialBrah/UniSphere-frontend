import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../stores/authStore'

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => useAuthStore.getState().logout(),
  })
}
