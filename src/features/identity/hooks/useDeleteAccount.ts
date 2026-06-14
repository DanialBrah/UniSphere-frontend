import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { userApi } from '../api/userApi'
import { useAuthStore } from '../../../stores/authStore'
import { stompClient } from '../../../lib/stompClient'
import { getStompCleanupFunctions } from './useLogin'

export function useDeleteAccount() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: () => {
      const { stompConnectCleanup, stompDisconnectCleanup } = getStompCleanupFunctions()
      stompConnectCleanup?.()
      stompDisconnectCleanup?.()
      if (stompClient.active) stompClient.deactivate()
      useAuthStore.getState().logout()
      navigate('/login', { replace: true })
      toast.success('Your account has been deleted.')
    },
    onError: () => {
      toast.error('Failed to delete account. Please try again.')
    },
  })
}
