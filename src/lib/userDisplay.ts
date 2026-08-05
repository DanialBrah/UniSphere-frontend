import type { UserProfileResponse } from '../features/identity/types/auth'

/**
 * The display name for an account. Which field holds it depends on the role, so the switch is
 * the only honest way to read it — and because UserProfileResponse is a discriminated union,
 * TypeScript checks that every role is covered.
 */
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

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Convenience for avatar placeholders, which always want initials from the display name. */
export function userInitials(user: UserProfileResponse): string {
  return getInitials(displayName(user) || user.email)
}
