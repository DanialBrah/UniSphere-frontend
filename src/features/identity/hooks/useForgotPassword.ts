import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import type { ForgotPasswordRequest } from '../types/auth'

export function useForgotPassword() {
  return useMutation<void, Error, ForgotPasswordRequest>({
    mutationFn: authApi.forgotPassword,
  })
}
