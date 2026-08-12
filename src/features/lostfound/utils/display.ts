import type {
  LostFoundCategory,
  LostFoundClaimStatus,
  LostFoundItemStatus,
  LostFoundItemType,
} from '../types'

/**
 * Label and chip-class maps for every Lost & Found union.
 *
 * Full `Record<Union, string>` rather than partial maps with a fallback, deliberately: adding a
 * member to one of these unions then becomes a compile error at every display site instead of a
 * silent blank chip in production.
 *
 * Note `primary-300` is not defined in tailwind.config.js — use `primary-400` in violet slots.
 */

export const TYPE_LABEL: Record<LostFoundItemType, string> = {
  LOST: 'Lost',
  FOUND: 'Found',
}

/** Amber for lost, emerald for found — the same pairing the map pins use. */
export const TYPE_CHIP: Record<LostFoundItemType, string> = {
  LOST: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  FOUND: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
}

export const STATUS_LABEL: Record<LostFoundItemStatus, string> = {
  OPEN: 'Open',
  CLAIMED: 'Claimed',
  RESOLVED: 'Returned',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
}

export const STATUS_CHIP: Record<LostFoundItemStatus, string> = {
  OPEN: 'bg-primary-100 text-primary-700 dark:bg-primary/15 dark:text-primary-400',
  CLAIMED: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  EXPIRED: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
}

/** One line of plain English per status, for the detail page's status bar. */
export const STATUS_HINT: Record<LostFoundItemStatus, string> = {
  OPEN: 'Anyone can submit a claim on this item.',
  CLAIMED: 'A claim has been approved. Arrange the handover with the claimant.',
  RESOLVED: 'This item is back with its owner.',
  EXPIRED: 'Nobody claimed this within 60 days. Relist it to reopen it.',
  CANCELLED: 'The reporter withdrew this listing.',
}

/** Only the three a user may pick — the server 409s on `CLAIMED` and `EXPIRED`. */
export const STATUS_ORDER: LostFoundItemStatus[] = [
  'OPEN',
  'CLAIMED',
  'RESOLVED',
  'EXPIRED',
  'CANCELLED',
]

export const CLAIM_STATUS_LABEL: Record<LostFoundClaimStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Withdrawn',
}

export const CLAIM_STATUS_CHIP: Record<LostFoundClaimStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
}

export const CLAIM_STATUS_ORDER: LostFoundClaimStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
]

export const CATEGORY_LABEL: Record<LostFoundCategory, string> = {
  ELECTRONICS: 'Electronics',
  DOCUMENTS: 'Documents',
  CARDS_AND_KEYS: 'Cards & keys',
  CLOTHING: 'Clothing',
  BAGS: 'Bags',
  ACCESSORIES: 'Accessories',
  BOOKS: 'Books',
  SPORTS: 'Sports',
  PETS: 'Pets',
  OTHER: 'Other',
}

/** Commonest first, `OTHER` last — the order the filter chips and the category select both use. */
export const CATEGORY_ORDER: LostFoundCategory[] = [
  'ELECTRONICS',
  'CARDS_AND_KEYS',
  'DOCUMENTS',
  'BAGS',
  'CLOTHING',
  'ACCESSORIES',
  'BOOKS',
  'SPORTS',
  'PETS',
  'OTHER',
]

export const TYPE_ORDER: LostFoundItemType[] = ['LOST', 'FOUND']

/**
 * "Where it was lost" vs "where it was found" — one field, two meanings, and getting it backwards
 * makes the form incomprehensible. Same for the pickup pair, which inverts on a LOST report.
 */
export const INCIDENT_PLACE_LABEL: Record<LostFoundItemType, string> = {
  LOST: 'Where did you lose it?',
  FOUND: 'Where did you find it?',
}

export const PICKUP_PLACE_LABEL: Record<LostFoundItemType, string> = {
  LOST: 'Where should it be returned to you?',
  FOUND: 'Where can the owner collect it?',
}

export const OCCURRED_AT_LABEL: Record<LostFoundItemType, string> = {
  LOST: 'When did you lose it?',
  FOUND: 'When did you find it?',
}
