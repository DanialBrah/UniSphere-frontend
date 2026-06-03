import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../stores/authStore'
import type {
  AuthResponse,
  RegisterAlumniRequest,
  RegisterClubRequest,
  RegisterEmployerRequest,
  RegisterStudentRequest,
} from '../types/auth'

export type RegisterRole = 'STUDENT' | 'ALUMNI' | 'EMPLOYER' | 'CLUB'

type RegisterPayload =
  | RegisterStudentRequest
  | RegisterAlumniRequest
  | RegisterEmployerRequest
  | RegisterClubRequest

const REGISTER_FN: Record<RegisterRole, (data: RegisterPayload) => Promise<AuthResponse>> = {
  STUDENT: (d) => authApi.registerStudent(d as RegisterStudentRequest),
  ALUMNI: (d) => authApi.registerAlumni(d as RegisterAlumniRequest),
  EMPLOYER: (d) => authApi.registerEmployer(d as RegisterEmployerRequest),
  CLUB: (d) => authApi.registerClub(d as RegisterClubRequest),
}

export function useRegister(role: RegisterRole) {
  return useMutation({
    mutationFn: (data: RegisterPayload) => REGISTER_FN[role](data),
    onSuccess: ({ accessToken, refreshToken, user }) => {
      useAuthStore.getState().setAuth(accessToken, refreshToken, user)
    },
  })
}
