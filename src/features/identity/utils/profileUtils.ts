import type { UserProfileResponse } from '../types/auth'

export function displayName(user: UserProfileResponse): string {
  switch (user.role) {
    case 'STUDENT':
    case 'ALUMNI':
    case 'ADMIN':
      return user.fullName
    case 'EMPLOYER':
      return user.companyName
    case 'CLUB':
    case 'UNIVERSITY':
      return user.name
  }
}
