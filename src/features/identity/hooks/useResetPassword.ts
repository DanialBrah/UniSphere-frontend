import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import type { ResetPasswordRequest } from '../types/auth'

export function useResetPassword() {
  return useMutation<void, Error, ResetPasswordRequest>({
    mutationFn: authApi.resetPassword,
  })
}
