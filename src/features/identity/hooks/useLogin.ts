import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../stores/authStore'

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ accessToken, refreshToken, user }) => {
      useAuthStore.getState().setAuth(accessToken, refreshToken, user)
    },
  })
}
