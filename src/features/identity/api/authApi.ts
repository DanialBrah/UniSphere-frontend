import api from '../../../lib/axios'
import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  RegisterAlumniRequest,
  RegisterClubRequest,
  RegisterEmployerRequest,
  RegisterStudentRequest,
  ResetPasswordRequest,
  UserProfileResponse,
} from '../types/auth'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

export const authApi = {
  login: (body: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', body).then(unwrap),

  registerStudent: (body: RegisterStudentRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register/student', body).then(unwrap),

  registerAlumni: (body: RegisterAlumniRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register/alumni', body).then(unwrap),

  registerEmployer: (body: RegisterEmployerRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register/employer', body).then(unwrap),

  registerClub: (body: RegisterClubRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register/club', body).then(unwrap),

  logout: (body: LogoutRequest) =>
    api.post<ApiResponse<null>>('/auth/logout', body).then(() => undefined),

  forgotPassword: (body: ForgotPasswordRequest) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', body).then(() => undefined),

  resetPassword: (body: ResetPasswordRequest) =>
    api.post<ApiResponse<null>>('/auth/reset-password', body).then(() => undefined),

  getMe: () =>
    api.get<ApiResponse<UserProfileResponse>>('/auth/me').then(unwrap),
}
