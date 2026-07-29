import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userApi } from '../api/userApi'
import type { UpdateProfilePayload } from '../api/userApi'
import { useAuthStore } from '../../../stores/authStore'
import { getErrorMessage } from '../../../lib/utils'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      const { accessToken } = useAuthStore.getState()
      if (accessToken) {
        useAuthStore.getState().setAuth(accessToken, updatedUser)
      }
      queryClient.setQueryData(['auth', 'me'], updatedUser)
      toast.success('Profile updated')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
