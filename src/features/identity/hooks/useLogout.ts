import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../stores/authStore'
import { stompClient } from '../../../lib/stompClient'

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      if (stompClient.active) stompClient.deactivate()
      useAuthStore.getState().logout()
    },
  })
}
