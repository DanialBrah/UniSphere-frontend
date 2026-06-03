export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
  error?: { code: string; message: string }
}

export type UserRole = 'STUDENT' | 'ALUMNI' | 'EMPLOYER' | 'UNIVERSITY' | 'CLUB' | 'ADMIN'
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'

interface UserProfileBase {
  id: number
  email: string
  role: UserRole
  status: UserStatus
  isVerified: boolean
  avatarUrl: string | null
  phone: string | null
  createdAt?: string
}

export interface StudentProfile extends UserProfileBase {
  role: 'STUDENT'
  fullName: string
  matricNumber: string | null
  universityEmail: string | null
  universityId: number | null
  faculty: string | null
  program: string | null
  yearOfStudy: number | null
  enrollmentDate: string | null
  expectedGraduation: string | null
}

export interface AlumniProfile extends UserProfileBase {
  role: 'ALUMNI'
  fullName: string
  universityId: number | null
  graduationYear: string
  degree: string | null
  major: string | null
  currentCompany: string | null
  currentPosition: string | null
  linkedinUrl: string | null
}

export interface EmployerProfile extends UserProfileBase {
  role: 'EMPLOYER'
  companyName: string
  companyLogoUrl: string | null
  industry: string | null
  companySize: string | null
  websiteUrl: string | null
  description: string | null
  companyVerified: boolean
}

export interface ClubProfile extends UserProfileBase {
  role: 'CLUB'
  name: string
  universityId: number | null
  description: string | null
  logoUrl: string | null
  category: string | null
  isOfficial: boolean
}

export interface UniversityProfile extends UserProfileBase {
  role: 'UNIVERSITY'
  name: string
  shortName: string | null
  logoUrl: string | null
  websiteUrl: string | null
  address: string | null
  country: string | null
  state: string | null
  institutionVerified: boolean
}

export interface AdminProfile extends UserProfileBase {
  role: 'ADMIN'
  fullName: string
  adminLevel: string
}

export type UserProfileResponse =
  | StudentProfile
  | AlumniProfile
  | EmployerProfile
  | ClubProfile
  | UniversityProfile
  | AdminProfile

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: UserProfileResponse
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterStudentRequest {
  email: string
  password: string
  fullName: string
  matricNumber: string
  universityEmail?: string
  universityId?: number
  phone?: string
  faculty?: string
  program?: string
  yearOfStudy?: number
}

export interface RegisterAlumniRequest {
  email: string
  password: string
  fullName: string
  graduationYear: string
  universityId?: number
  phone?: string
  degree?: string
  major?: string
  currentCompany?: string
  currentPosition?: string
  linkedinUrl?: string
}

export interface RegisterEmployerRequest {
  email: string
  password: string
  companyName: string
  phone?: string
  industry?: string
  companySize?: string
  websiteUrl?: string
  description?: string
}

export interface RegisterClubRequest {
  email: string
  password: string
  name: string
  universityId: number
  phone?: string
  category?: string
  description?: string
}
