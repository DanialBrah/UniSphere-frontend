import type { CommunityMemberRole } from '../types'

/**
 * Mirrors the backend's role-hierarchy check used by both kick and ban: an ADMIN can act on
 * anyone, a MODERATOR only on a plain MEMBER, and a MEMBER can't act on anyone. Used to hide
 * controls the backend would 400/403 on rather than let the user click into an error.
 *
 * Role-change (promote/demote) is stricter than this — the endpoint is ADMIN-only, so callers
 * must additionally check `viewerRole === 'ADMIN'` before showing those controls.
 *
 * Callers must also separately exclude acting on themselves (`targetUserId !== viewerUserId`) —
 * this helper only knows roles, not identity.
 */
export function canManageMember(
  viewerRole: CommunityMemberRole | null,
  targetRole: CommunityMemberRole,
): boolean {
  if (viewerRole === 'ADMIN') return true
  if (viewerRole === 'MODERATOR') return targetRole === 'MEMBER'
  return false
}
