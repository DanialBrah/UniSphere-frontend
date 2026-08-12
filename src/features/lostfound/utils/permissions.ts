import type { UserProfileResponse } from '../../identity/types/auth'
import type {
  LostFoundClaimResponse,
  LostFoundItemStatus,
  LostFoundItemSummaryResponse,
  LostFoundUserStatusTarget,
} from '../types'

/**
 * UI mirroring only. Every rule here is enforced independently by LostFoundAccessService,
 * LostFoundService.changeStatus and LostFoundClaimService on the server; these predicates exist to
 * avoid showing a control that would fail, not to authorise anything. A stale token or a role
 * change makes the client's view wrong, so never treat a passing check as permission.
 */

export function isReporter(
  user: UserProfileResponse | null | undefined,
  item: { reporter: { id: number } },
): boolean {
  return !!user && user.id === item.reporter.id
}

/**
 * The server also sends `canModify` on every item, computed from the same rule. Prefer that when
 * it's available; this exists for the places holding only a user and a reporter id.
 */
export function canModifyItem(
  user: UserProfileResponse | null | undefined,
  item: { reporter: { id: number } },
): boolean {
  if (!user) return false
  return user.id === item.reporter.id || user.role === 'ADMIN'
}

/**
 * Submitting requires all three: not your own item, the item still OPEN, and no live claim of
 * yours already on it. A REJECTED claim does *not* block a fresh attempt — there is deliberately
 * no unique constraint server-side, so someone rejected in error can try again.
 */
export function canSubmitClaim(
  user: UserProfileResponse | null | undefined,
  item: LostFoundItemSummaryResponse,
): boolean {
  if (!user) return false
  if (user.id === item.reporter.id) return false
  if (item.status !== 'OPEN') return false
  return item.viewerClaimStatus !== 'PENDING' && item.viewerClaimStatus !== 'APPROVED'
}

/** Approve and reject belong to the item's reporter (or an admin), never to the claimant. */
export function canDecideClaim(
  user: UserProfileResponse | null | undefined,
  item: { reporter: { id: number } },
  claim: LostFoundClaimResponse,
): boolean {
  if (!user || claim.status !== 'PENDING') return false
  return user.id === item.reporter.id || user.role === 'ADMIN'
}

/** Withdrawal is the claimant's alone — an admin cannot withdraw on someone's behalf. */
export function canCancelClaim(
  user: UserProfileResponse | null | undefined,
  claim: LostFoundClaimResponse,
): boolean {
  return !!user && claim.status === 'PENDING' && user.id === claim.claimant.id
}

/**
 * The status transitions a user may actually pick, mirroring the FSM in
 * `LostFoundService.changeStatus`. `CLAIMED` is written only by claim approval and `EXPIRED` only
 * by the nightly sweep — `PATCH /items/{id}/status` rejects both outright with a 409 — so neither
 * ever appears here.
 */
export function allowedStatusTargets(
  status: LostFoundItemStatus,
): readonly LostFoundUserStatusTarget[] {
  switch (status) {
    case 'OPEN':
      return ['RESOLVED', 'CANCELLED']
    // Reopening a CLAIMED item is the "handover fell through" path; the approved claim row stays
    // as history.
    case 'CLAIMED':
      return ['RESOLVED', 'CANCELLED', 'OPEN']
    case 'EXPIRED':
      return ['OPEN']
    case 'RESOLVED':
    case 'CANCELLED':
      return []
  }
}

/** Editing a closed listing is pointless and the server would reject the status change anyway. */
export function isTerminalStatus(status: LostFoundItemStatus): boolean {
  return status === 'RESOLVED' || status === 'CANCELLED'
}
