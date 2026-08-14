import type { ServiceDeliveryMode, ServiceListingStatus, ServiceOrderStatus, ServicePricingType } from '../types'

/**
 * Label and chip-class maps for every Services union.
 *
 * Full `Record<Union, string>` rather than partial maps with a fallback, deliberately: adding a
 * member to one of these unions then becomes a compile error at every display site instead of a
 * silent blank chip in production. Same discipline as `jobs/utils/display.ts`.
 */

export const PRICING_TYPE_LABEL: Record<ServicePricingType, string> = {
  FIXED: 'Fixed price',
  HOURLY: 'Hourly rate',
  NEGOTIABLE: 'Negotiable',
}

export const PRICING_TYPE_CHIP: Record<ServicePricingType, string> = {
  FIXED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  HOURLY: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  NEGOTIABLE: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
}

export const PRICING_TYPE_ORDER: ServicePricingType[] = ['FIXED', 'HOURLY', 'NEGOTIABLE']

export const DELIVERY_MODE_LABEL: Record<ServiceDeliveryMode, string> = {
  ONLINE: 'Online',
  PHYSICAL: 'In person',
  BOTH: 'Online or in person',
}

export const DELIVERY_MODE_CHIP: Record<ServiceDeliveryMode, string> = {
  ONLINE: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  PHYSICAL: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  BOTH: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
}

export const DELIVERY_MODE_ORDER: ServiceDeliveryMode[] = ['ONLINE', 'PHYSICAL', 'BOTH']

export const LISTING_STATUS_LABEL: Record<ServiceListingStatus, string> = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
}

export const LISTING_STATUS_CHIP: Record<ServiceListingStatus, string> = {
  ACTIVE: 'bg-primary-100 text-primary-700 dark:bg-primary/15 dark:text-primary-400',
  PAUSED: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
}

export const ORDER_STATUS_LABEL: Record<ServiceOrderStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
}

export const ORDER_STATUS_CHIP: Record<ServiceOrderStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
  ACCEPTED: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  DISPUTED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

export const ORDER_STATUS_ORDER: ServiceOrderStatus[] = [
  'PENDING',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
]

/** Formats a listing's price given its pricing type — NEGOTIABLE listings have no listing-level price. */
export function formatServicePrice(price: number | null, pricingType: ServicePricingType): string {
  if (pricingType === 'NEGOTIABLE' || price == null) return 'Negotiable'
  const amount = price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return pricingType === 'HOURLY' ? `RM ${amount}/hr` : `RM ${amount}`
}

export function formatRating(ratingAvg: number, ratingCount: number): string {
  if (ratingCount === 0) return 'No reviews yet'
  return `${ratingAvg.toFixed(1)} (${ratingCount} review${ratingCount === 1 ? '' : 's'})`
}
