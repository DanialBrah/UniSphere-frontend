import api from '../../../lib/axios'
import type { ApiResponse, UserProfileResponse } from '../types/auth'
import type { SpringPage } from '../../social/types'

export interface UpdateProfilePayload {
  avatarUrl?: string | null   // undefined=no change, ""=remove, key=set new
  phone?: string
  // STUDENT / ALUMNI / ADMIN
  fullName?: string
  // STUDENT
  faculty?: string
  program?: string
  yearOfStudy?: number
  // ALUMNI
  currentCompany?: string
  currentPosition?: string
  linkedinUrl?: string
  // EMPLOYER
  companyName?: string
  industry?: string
  companySize?: string
  websiteUrl?: string
  description?: string
  // UNIVERSITY
  shortName?: string
  address?: string
  country?: string
  state?: string
  // CLUB
  category?: string
}

export interface UserSearchResult {
  id: number
  displayName: string
  avatarUrl: string | null
  role: string
  email: string
}

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

export const userApi = {
  getMe: (): Promise<UserProfileResponse> =>
    api.get<ApiResponse<UserProfileResponse>>('/users/me').then(unwrap),

  getUserById: (id: number): Promise<UserProfileResponse> =>
    api.get<ApiResponse<UserProfileResponse>>(`/users/${id}`).then(unwrap),

  updateProfile: (body: UpdateProfilePayload): Promise<UserProfileResponse> =>
    api.put<ApiResponse<UserProfileResponse>>('/users/me', body).then(unwrap),

  searchUsers: (q: string): Promise<UserSearchResult[]> =>
    api
      .get<ApiResponse<SpringPage<UserSearchResult>>>('/users/search', { params: { q } })
      .then((r) => unwrapPage(r).content),

  deleteAccount: (): Promise<void> =>
    api.delete<ApiResponse<null>>('/users/me').then(() => undefined),
}
