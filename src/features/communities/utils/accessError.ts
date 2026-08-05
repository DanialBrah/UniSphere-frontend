import { parseApiError } from '../../../lib/utils'
import type { CommunityMemberRole } from '../types'

/**
 * True when a content-gated read (posts/members/announcements) failed because the viewer
 * isn't allowed to see it yet, not because of a genuine load failure.
 *
 * The backend expresses "you can't see this" two different ways depending on the endpoint:
 * a plain 403, or — observed in practice — a 404 "Community not found" from
 * `CommunityNotFoundException`, reused as the access-denied response for these sub-resources
 * (likely deliberate, so a non-member can't distinguish "private" from "doesn't exist").
 * Safe to treat both as access-denied here because callers only reach this after the parent
 * page's own `GET /communities/{id}` already succeeded — so the community definitely exists.
 */
export function isAccessDeniedError(error: unknown, viewerRole: CommunityMemberRole | null): boolean {
  if (viewerRole != null) return false
  const status = parseApiError(error).status
  return status === 403 || status === 404
}
