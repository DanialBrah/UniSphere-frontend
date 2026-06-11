import api from '../../../lib/axios'
import type { ApiResponse, UserProfileResponse } from '../types/auth'

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

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

export const userApi = {
  updateProfile: (body: UpdateProfilePayload): Promise<UserProfileResponse> =>
    api.put<ApiResponse<UserProfileResponse>>('/users/me', body).then(unwrap),
}
