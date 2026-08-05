import type { UserProfileResponse, UserRole } from '../../identity/types/auth'
import type { NewsStatus } from '../types'

/**
 * UI mirroring only. Every rule here is enforced independently by NewsAccessService on the
 * server; these predicates exist to avoid showing a control that would fail, not to authorise
 * anything. A stale token or a role change makes the client's view wrong, so never treat a
 * passing check as permission.
 */

/** Institutional accounts author news; students and alumni are readers. */
export const NEWS_AUTHOR_ROLES: readonly UserRole[] = [
  'UNIVERSITY',
  'EMPLOYER',
  'CLUB',
  'ADMIN',
]

export function canAuthorNews(user: UserProfileResponse | null | undefined): boolean {
  return !!user && NEWS_AUTHOR_ROLES.includes(user.role)
}

export function canModifyArticle(
  user: UserProfileResponse | null | undefined,
  article: { author: { id: number } },
): boolean {
  if (!user) return false
  return user.id === article.author.id || user.role === 'ADMIN'
}

/**
 * UNIVERSITY visibility requires the author to resolve to a university id server-side.
 *
 * A UNIVERSITY account is its own university. A CLUB has a *nullable* universityId — the
 * seeded club's is null — and an EMPLOYER or ADMIN has no affiliation at all, so both get a
 * 400 rather than a scoped article. The gate is therefore not simply "UNIVERSITY and CLUB".
 */
export function canUseUniversityVisibility(
  user: UserProfileResponse | null | undefined,
): boolean {
  if (!user) return false
  switch (user.role) {
    case 'UNIVERSITY':
      return true
    case 'CLUB':
      return user.universityId != null
    case 'EMPLOYER':
    case 'ADMIN':
    case 'STUDENT':
    case 'ALUMNI':
      return false
  }
}

/** Comments are only accepted on published articles; drafts and archives are read-only. */
export function canCommentOn(article: { status: NewsStatus }): boolean {
  return article.status === 'PUBLISHED'
}

/** Comment edit is owner-only — unlike delete, an admin cannot rewrite someone's words. */
export function canEditComment(
  user: UserProfileResponse | null | undefined,
  comment: { author: { id: number } },
): boolean {
  return !!user && user.id === comment.author.id
}

export function canDeleteComment(
  user: UserProfileResponse | null | undefined,
  comment: { author: { id: number } },
): boolean {
  if (!user) return false
  return user.id === comment.author.id || user.role === 'ADMIN'
}
