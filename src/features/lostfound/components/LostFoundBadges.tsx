import { MapPinOff } from 'lucide-react'
import {
  CATEGORY_LABEL,
  CLAIM_STATUS_CHIP,
  CLAIM_STATUS_LABEL,
  STATUS_CHIP,
  STATUS_LABEL,
  TYPE_CHIP,
  TYPE_LABEL,
} from '../utils/display'
import type {
  LostFoundCategory,
  LostFoundClaimStatus,
  LostFoundItemStatus,
  LostFoundItemType,
} from '../types'

const CHIP = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold'

export function LostFoundTypeBadge({ type }: Readonly<{ type: LostFoundItemType }>) {
  return <span className={`${CHIP} ${TYPE_CHIP[type]}`}>{TYPE_LABEL[type]}</span>
}

export function LostFoundStatusBadge({ status }: Readonly<{ status: LostFoundItemStatus }>) {
  return <span className={`${CHIP} ${STATUS_CHIP[status]}`}>{STATUS_LABEL[status]}</span>
}

export function LostFoundClaimStatusBadge({
  status,
}: Readonly<{ status: LostFoundClaimStatus }>) {
  return <span className={`${CHIP} ${CLAIM_STATUS_CHIP[status]}`}>{CLAIM_STATUS_LABEL[status]}</span>
}

export function LostFoundCategoryBadge({ category }: Readonly<{ category: LostFoundCategory }>) {
  return (
    <span
      className={`${CHIP} bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300`}
    >
      {CATEGORY_LABEL[category]}
    </span>
  )
}

/**
 * The affordance that keeps the privacy guard from reading as a bug.
 *
 * A FOUND item's coordinates are rounded to ~1.1 km for anyone without an approved claim. Without
 * this badge the pin simply sits in the wrong place and the app looks broken.
 */
export function ApproximateLocationBadge({ className = '' }: Readonly<{ className?: string }>) {
  return (
    <span
      className={`${CHIP} bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 ${className}`}
      title="The exact spot is hidden until a claim is approved"
    >
      <MapPinOff className="h-3 w-3" />
      Approximate
    </span>
  )
}
