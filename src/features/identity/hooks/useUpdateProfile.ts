import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userApi } from '../api/userApi'
import type { UpdateProfilePayload } from '../api/userApi'
import { useAuthStore } from '../../../stores/authStore'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      const { accessToken, refreshToken } = useAuthStore.getState()
      if (accessToken && refreshToken) {
        useAuthStore.getState().setAuth(accessToken, refreshToken, updatedUser)
      }
      queryClient.setQueryData(['auth', 'me'], updatedUser)
      toast.success('Profile updated')
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })
}
