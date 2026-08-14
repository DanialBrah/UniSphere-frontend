import type { UserProfileResponse } from '../../identity/types/auth'
import type { ServiceOrderResponse, ServiceOrderStatus } from '../types'

/**
 * UI mirroring only. Every rule here is enforced independently by `ServiceAccessService` and
 * `ServiceListingService`/`ServiceOrderService` server-side; these predicates exist to avoid
 * showing a control that would fail, not to authorise anything. A stale token or a role change
 * makes the client's view wrong, so never treat a passing check as permission.
 */

/** STUDENT, ALUMNI and CLUB only — matches `ServiceAccessService.assertCanCreate`. */
export function canCreateService(user: UserProfileResponse | null | undefined): boolean {
  return user?.role === 'STUDENT' || user?.role === 'ALUMNI' || user?.role === 'CLUB'
}

/**
 * Everyone but ADMIN may order — deliberately broader than `canCreateService`: ordering is a
 * purchase action, not "apply to work/join a team". Matches `ServiceAccessService.assertCanOrder`.
 */
export function canOrderService(user: UserProfileResponse | null | undefined): boolean {
  return !!user && user.role !== 'ADMIN'
}

/**
 * The listing's provider, or an ADMIN. The server also sends `canModify` on every listing, computed
 * from the same rule — prefer that when it's available; this exists for the places holding only a
 * user and a provider id.
 */
export function canModifyListing(
  user: UserProfileResponse | null | undefined,
  listing: { provider: { id: number } },
): boolean {
  if (!user) return false
  return user.id === listing.provider.id || user.role === 'ADMIN'
}

/** ACTIVE<->PAUSED — the only two listing states, so the "other" one is always the sole target. */
export function allowedListingStatusTargets(status: 'ACTIVE' | 'PAUSED'): readonly ('ACTIVE' | 'PAUSED')[] {
  return status === 'ACTIVE' ? ['PAUSED'] : ['ACTIVE']
}

const CANCELLABLE_FROM: readonly ServiceOrderStatus[] = ['PENDING', 'ACCEPTED']
const DISPUTABLE_FROM: readonly ServiceOrderStatus[] = ['ACCEPTED', 'IN_PROGRESS']

export function isTerminalOrderStatus(status: ServiceOrderStatus): boolean {
  return status === 'COMPLETED' || status === 'CANCELLED' || status === 'DISPUTED'
}

/**
 * The transitions a given viewer may actually pick for one order, mirroring
 * `ServiceOrderService.updateOrderStatus`'s FSM exactly:
 * - PENDING -> ACCEPTED / IN_PROGRESS -> COMPLETED: provider/ADMIN only.
 * - PENDING|ACCEPTED -> CANCELLED, ACCEPTED|IN_PROGRESS -> DISPUTED: client, provider or ADMIN.
 */
export function allowedOrderStatusTargets(
  status: ServiceOrderStatus,
  isProviderOrAdmin: boolean,
  isClient: boolean,
): readonly Exclude<ServiceOrderStatus, 'PENDING'>[] {
  if (isTerminalOrderStatus(status)) return []

  const targets: Exclude<ServiceOrderStatus, 'PENDING'>[] = []
  if (isProviderOrAdmin) {
    if (status === 'PENDING') targets.push('ACCEPTED')
    if (status === 'ACCEPTED') targets.push('IN_PROGRESS')
    if (status === 'IN_PROGRESS') targets.push('COMPLETED')
  }
  if ((isClient || isProviderOrAdmin) && CANCELLABLE_FROM.includes(status)) targets.push('CANCELLED')
  if ((isClient || isProviderOrAdmin) && DISPUTABLE_FROM.includes(status)) targets.push('DISPUTED')
  return targets
}

/** Accept requires a resolved price — only unresolved for a NEGOTIABLE order with no price yet. */
export function acceptNeedsAgreedPrice(order: { agreedPrice: number | null }): boolean {
  return order.agreedPrice == null
}

/** COMPLETED orders only, one review per person per order — checked against `listReviewsForOrder`. */
export function canReviewOrder(
  user: UserProfileResponse | null | undefined,
  order: ServiceOrderResponse,
  alreadyReviewed: boolean,
): boolean {
  if (!user || alreadyReviewed) return false
  if (order.status !== 'COMPLETED') return false
  const isClient = order.client.id === user.id
  const isProvider = order.provider?.id === user.id
  return isClient || isProvider
}
