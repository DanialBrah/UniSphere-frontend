import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../stores/authStore'
import { stompClient } from '../../../lib/stompClient'
import { getStompCleanupFunctions } from './useLogin'

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      const { stompConnectCleanup, stompDisconnectCleanup } = getStompCleanupFunctions()
      stompConnectCleanup?.()
      stompDisconnectCleanup?.()
      if (stompClient.active) stompClient.deactivate()
      useAuthStore.getState().logout()
    },
  })
}
