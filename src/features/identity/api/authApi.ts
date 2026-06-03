import api from '../../../lib/axios'
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterAlumniRequest,
  RegisterClubRequest,
  RegisterEmployerRequest,
  RegisterStudentRequest,
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
}
