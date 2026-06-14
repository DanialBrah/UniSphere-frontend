import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../stores/authStore'
import { useChatStore } from '../../../stores/chatStore'
import { stompClient, addStompConnectListener, addStompDisconnectListener } from '../../../lib/stompClient'

// Module-level storage for cleanup functions, accessible to useLogout and useDeleteAccount
let stompConnectCleanup: (() => void) | null = null
let stompDisconnectCleanup: (() => void) | null = null

export function getStompCleanupFunctions() {
  return { stompConnectCleanup, stompDisconnectCleanup }
}

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ accessToken, refreshToken, user }) => {
      useAuthStore.getState().setAuth(accessToken, refreshToken, user)
      stompClient.configure({ connectHeaders: { Authorization: `Bearer ${accessToken}` } })
      stompConnectCleanup = addStompConnectListener(() => useChatStore.getState().setStompConnected(true))
      stompDisconnectCleanup = addStompDisconnectListener(() => useChatStore.getState().setStompConnected(false))
      if (!stompClient.active) stompClient.activate()
    },
  })
}
