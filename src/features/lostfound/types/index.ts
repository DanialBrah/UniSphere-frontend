import type { ApiResponse, UserRole } from '../../identity/types/auth'
import type { SpringPage } from '../../social/types'

export type { ApiResponse, UserRole, SpringPage }

// String-literal unions rather than TS enums — tsconfig sets `erasableSyntaxOnly`.
export type LostFoundItemType = 'LOST' | 'FOUND'
export type LostFoundItemStatus = 'OPEN' | 'CLAIMED' | 'RESOLVED' | 'EXPIRED' | 'CANCELLED'
export type LostFoundClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type LostFoundMediaType = 'IMAGE' | 'VIDEO'
export type LostFoundCategory =
  | 'ELECTRONICS'
  | 'DOCUMENTS'
  | 'CARDS_AND_KEYS'
  | 'CLOTHING'
  | 'BAGS'
  | 'ACCESSORIES'
  | 'BOOKS'
  | 'SPORTS'
  | 'PETS'
  | 'OTHER'

/**
 * Only the three a user may choose. `CLAIMED` is written solely by claim approval and `EXPIRED`
 * solely by the nightly sweep — `PATCH /items/{id}/status` rejects both with a 409.
 */
export type LostFoundUserStatusTarget = Extract<
  LostFoundItemStatus,
  'OPEN' | 'RESOLVED' | 'CANCELLED'
>

/** `LostFoundUserResponse.role` falls back to the literal "UNKNOWN" when the user row is missing. */
export type LostFoundUserRole = UserRole | 'UNKNOWN'

// ── Responses ────────────────────────────────────────────────────────────────

export interface LostFoundUserResponse {
  id: number
  displayName: string
  /** Presigned GET URL — expires after ~60 minutes. Never persist it. */
  avatarUrl: string | null
  role: LostFoundUserRole
}

export interface LostFoundMediaResponse {
  id: number
  /** Presigned GET URL minted per read. The entity stores a bare key. */
  mediaUrl: string
  mediaType: LostFoundMediaType
  sortOrder: number
}

/**
 * Fields the privacy guard withholds on a FOUND item from anyone without an approved claim —
 * see `LostFoundAccessService.locationViewFor`. Reading any of these as "the reporter left it
 * blank" is wrong; check `coordinatesApproximate` and ownership first.
 */
export interface LostFoundItemSummaryResponse {
  id: number
  reporter: LostFoundUserResponse
  itemType: LostFoundItemType
  category: LostFoundCategory
  status: LostFoundItemStatus
  title: string
  /** Presigned GET URL, ~60 min expiry. */
  primaryImageUrl: string | null
  incidentPlace: string | null
  /** Rounded to 2 dp (~1.1 km) when `coordinatesApproximate` is true. */
  incidentLatitude: number | null
  incidentLongitude: number | null
  coordinatesApproximate: boolean
  /** Null for a FOUND item until the viewer's claim is approved. */
  pickupPlace: string | null
  pickupLatitude: number | null
  pickupLongitude: number | null
  universityId: number | null
  occurredAt: string
  pendingClaimCount: number
  /** The viewer's own claim on this item, if any — saves a second round trip. */
  viewerClaimStatus: LostFoundClaimStatus | null
  canModify: boolean
  createdAt: string
}

export interface LostFoundItemResponse extends LostFoundItemSummaryResponse {
  description: string | null
  /** Owner/ADMIN only, at every claim status — it is the adjudication secret. */
  identifyingDetail: string | null
  pickupInstructions: string | null
  resolvedAt: string | null
  /** Empty for a FOUND item viewed without an approved claim. */
  media: LostFoundMediaResponse[]
  updatedAt: string
}

/** Note the field names: plain `latitude`/`longitude`, not `incidentLatitude`/`incidentLongitude`. */
export interface LostFoundMapPinResponse {
  id: number
  itemType: LostFoundItemType
  status: LostFoundItemStatus
  category: LostFoundCategory
  title: string
  latitude: number | null
  longitude: number | null
  coordinatesApproximate: boolean
  thumbnailUrl: string | null
}

/** A wrapper rather than a nullable field on the summary, which would be null on six of seven endpoints. */
export interface LostFoundNearbyItemResponse {
  item: LostFoundItemSummaryResponse
  /** Computed from the true coordinates even when the returned ones are coarsened. */
  distanceKm: number
}

export interface LostFoundMatchResponse {
  item: LostFoundItemSummaryResponse
  /** 0–100. Category 30, geo 25, text 25, date 20. */
  score: number
  reasons: string[]
}

export interface LostFoundStatsResponse {
  totalItems: number
  /** Every enum constant is always present as a key, zero included — no null checks needed. */
  byType: Record<LostFoundItemType, number>
  byStatus: Record<LostFoundItemStatus, number>
  byCategory: Record<LostFoundCategory, number>
  /** Counted globally, unlike the other three buckets, which are university-scoped. */
  openClaims: number
}

export interface LostFoundClaimResponse {
  id: number
  itemId: number
  itemTitle: string
  claimant: LostFoundUserResponse
  status: LostFoundClaimStatus
  proofText: string
  /** Presigned GET URL, ~60 min expiry. */
  proofImageUrl: string | null
  decisionNote: string | null
  /** A raw user id, not a user object. Null while PENDING and after a self-cancel. */
  reviewedBy: number | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface LostFoundMediaPresignResponse {
  uploadUrl: string
  mediaKey: string
}

export interface LostFoundMediaUploadResponse {
  mediaKey: string
  mediaUrl: string
  mediaType: string
}

// ── Requests ─────────────────────────────────────────────────────────────────

export interface LostFoundMediaItem {
  /** A bare object key, never a URL, and it must start with `lost-found/{yourUserId}/`. */
  mediaKey: string
  mediaType: LostFoundMediaType
}

export interface CreateLostFoundItemRequest {
  itemType: LostFoundItemType
  category?: LostFoundCategory
  title: string
  description?: string
  identifyingDetail?: string
  primaryImageKey?: string
  incidentPlace?: string
  incidentLatitude?: number
  incidentLongitude?: number
  pickupPlace?: string
  pickupLatitude?: number
  pickupLongitude?: number
  pickupInstructions?: string
  /** Naive ISO local date-time, e.g. `2026-08-05T14:30:00`. Must not be in the future. */
  occurredAt: string
  media?: LostFoundMediaItem[]
}

/** PUT, but PATCH-like: an omitted field is untouched, a blank string clears a nullable text field. */
export interface UpdateLostFoundItemRequest {
  category?: LostFoundCategory
  title?: string
  description?: string
  identifyingDetail?: string
  primaryImageKey?: string
  incidentPlace?: string
  incidentLatitude?: number
  incidentLongitude?: number
  pickupPlace?: string
  pickupLatitude?: number
  pickupLongitude?: number
  pickupInstructions?: string
  occurredAt?: string
  /** A coordinate cannot be "blank", so clearing one needs an explicit flag. Nulls both of a pair. */
  clearIncidentLocation?: boolean
  clearPickupLocation?: boolean
  removeMediaIds?: number[]
  addMedia?: LostFoundMediaItem[]
}

export interface LostFoundStatusUpdateRequest {
  status: LostFoundUserStatusTarget
  note?: string
}

export interface CreateLostFoundClaimRequest {
  proofText: string
  proofImageKey?: string
}

export interface LostFoundClaimDecisionRequest {
  status: Exclude<LostFoundClaimStatus, 'PENDING'>
  decisionNote?: string
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface LostFoundFilters {
  type: LostFoundItemType | null
  status: LostFoundItemStatus | null
  category: LostFoundCategory | null
}

export const EMPTY_LOST_FOUND_FILTERS: LostFoundFilters = {
  type: null,
  status: null,
  category: null,
}

/** `/items/map` takes a bounding box and returns an unpaginated, server-capped list. */
export interface MapBounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export interface MapFilters {
  type: LostFoundItemType | null
  status: LostFoundItemStatus | null
}

export const EMPTY_MAP_FILTERS: MapFilters = { type: null, status: null }

/** Staged upload: the File plus its object URL. Uploaded at submit, since presigns expire in ~5 min. */
export interface PendingLostFoundMedia {
  file: File
  previewUrl: string
}

// ── Query keys ───────────────────────────────────────────────────────────────

/**
 * Every level is a valid invalidation prefix, so `lostFoundKeys.lists()` clears every filtered
 * board at once. Optional statuses use the literal `'ALL'` rather than `undefined`, which the
 * query hasher strips — `['lostfound','mine',undefined]` and `['lostfound','mine']` collide.
 */
export const lostFoundKeys = {
  all: ['lostfound'] as const,

  lists: () => ['lostfound', 'list'] as const,
  list: (filters: LostFoundFilters) => ['lostfound', 'list', filters] as const,
  searches: () => ['lostfound', 'search'] as const,
  search: (q: string) => ['lostfound', 'search', q] as const,

  maps: () => ['lostfound', 'map'] as const,
  map: (bounds: MapBounds, filters: MapFilters) =>
    ['lostfound', 'map', bounds, filters] as const,
  nearby: (lat: number, lng: number, radiusKm: number) =>
    ['lostfound', 'nearby', lat, lng, radiusKm] as const,

  mineAll: () => ['lostfound', 'mine'] as const,
  mine: (status: LostFoundItemStatus | 'ALL') => ['lostfound', 'mine', status] as const,

  details: () => ['lostfound', 'detail'] as const,
  detail: (itemId: number) => ['lostfound', 'detail', itemId] as const,
  matches: (itemId: number) => ['lostfound', 'matches', itemId] as const,
  stats: () => ['lostfound', 'stats'] as const,

  claims: () => ['lostfound', 'claims'] as const,
  itemClaims: (itemId: number, status: LostFoundClaimStatus | 'ALL') =>
    ['lostfound', 'claims', 'item', itemId, status] as const,
  itemClaimsAll: (itemId: number) => ['lostfound', 'claims', 'item', itemId] as const,
  myClaims: (status: LostFoundClaimStatus | 'ALL') =>
    ['lostfound', 'claims', 'me', status] as const,
  myClaimsAll: () => ['lostfound', 'claims', 'me'] as const,
  claimDetail: (claimId: number) => ['lostfound', 'claims', 'detail', claimId] as const,
} as const
