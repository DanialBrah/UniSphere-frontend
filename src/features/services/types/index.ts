import type { ApiResponse } from '../../identity/types/auth'
import type { SpringPage } from '../../social/types'

export type { ApiResponse, SpringPage }

// String-literal unions rather than TS enums — tsconfig sets `erasableSyntaxOnly`.
export type ServicePricingType = 'FIXED' | 'HOURLY' | 'NEGOTIABLE'
export type ServiceDeliveryMode = 'ONLINE' | 'PHYSICAL' | 'BOTH'
export type ServiceListingStatus = 'ACTIVE' | 'PAUSED'
export type ServiceOrderStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'

// ── Responses ────────────────────────────────────────────────────────────────

/** Denormalised actor block — whoever provides a listing, is a client, or reviewed. */
export interface ServiceProviderResponse {
  id: number
  displayName: string
  /** Presigned GET URL — expires after ~60 minutes. Never persist it. */
  avatarUrl: string | null
  role: string
}

/** Full detail view — `GET /services/{id}`. */
export interface ServiceListingResponse {
  id: number
  provider: ServiceProviderResponse
  title: string
  description: string | null
  /** Freeform text server-side — no backend-enforced taxonomy. */
  category: string
  pricingType: ServicePricingType
  price: number | null
  deliveryMode: ServiceDeliveryMode
  /** Presigned GET URL — expires after ~60 minutes. */
  portfolioImageUrl: string | null
  ratingAvg: number
  ratingCount: number
  status: ServiceListingStatus
  /** Null means visible to every university — a provider with no affiliation (Employer/Admin) posted it. */
  universityId: number | null
  /** Whether the caller may edit, change status or delete this listing. */
  canModify: boolean
  createdAt: string
  updatedAt: string
}

/** List/feed/search/me projection. Drops description and updatedAt. */
export interface ServiceListingSummaryResponse {
  id: number
  provider: ServiceProviderResponse
  title: string
  category: string
  pricingType: ServicePricingType
  price: number | null
  deliveryMode: ServiceDeliveryMode
  portfolioImageUrl: string | null
  ratingAvg: number
  ratingCount: number
  status: ServiceListingStatus
  universityId: number | null
  canModify: boolean
  createdAt: string
}

/** Owner/ADMIN-only per-listing breakdown — `GET /services/{id}/stats`. */
export interface ServiceListingStatsResponse {
  pending: number
  accepted: number
  inProgress: number
  completed: number
  cancelled: number
  disputed: number
  totalOrders: number
}

export interface ServiceOrderResponse {
  id: number
  listingId: number
  listingTitle: string
  /** Null only when the parent listing has been soft-deleted. */
  provider: ServiceProviderResponse | null
  client: ServiceProviderResponse
  requirements: string | null
  agreedPrice: number | null
  scheduledAt: string | null
  status: ServiceOrderStatus
  decisionReason: string | null
  /** The DM this order's conversation lives in — opened automatically when the order was placed. */
  conversationId: number | null
  createdAt: string
  updatedAt: string
}

export interface ServiceReviewResponse {
  id: number
  orderId: number
  reviewer: ServiceProviderResponse
  revieweeId: number
  rating: number
  comment: string | null
  createdAt: string
}

export interface ServiceMediaPresignResponse {
  uploadUrl: string
  mediaKey: string
}

export interface ServiceMediaUploadResponse {
  mediaKey: string
  mediaUrl: string
}

// ── Requests ─────────────────────────────────────────────────────────────────

export interface CreateServiceListingRequest {
  title: string
  description?: string
  category: string
  /** Null/omitted means FIXED server-side. */
  pricingType?: ServicePricingType
  price?: number
  /** Null/omitted means BOTH server-side. */
  deliveryMode?: ServiceDeliveryMode
  /** A key returned by `POST /services/media/presign` or `/upload`, owned by the caller. */
  portfolioImageKey?: string
}

/** PUT, but PATCH-like: an omitted field is untouched, a blank string clears a nullable text field. */
export interface UpdateServiceListingRequest {
  title?: string
  description?: string
  category?: string
  pricingType?: ServicePricingType
  price?: number
  /** True resets price to unset. Ignored when price is also supplied. */
  clearPrice?: boolean
  deliveryMode?: ServiceDeliveryMode
  portfolioImageKey?: string
  /** True clears the portfolio image. Ignored when portfolioImageKey is also supplied. */
  clearPortfolioImageKey?: boolean
}

export interface ServiceListingStatusUpdateRequest {
  status: ServiceListingStatus
}

/**
 * `proposedPrice` only matters for a NEGOTIABLE listing — FIXED/HOURLY listings always copy the
 * listing's own price and ignore this field.
 */
export interface CreateServiceOrderRequest {
  requirements?: string
  proposedPrice?: number
  /** Must be in the future. */
  scheduledAt?: string
}

/**
 * The single entry point for every actor in the order state machine — client, provider or admin
 * all funnel through this one request shape.
 */
export interface ServiceOrderStatusUpdateRequest {
  status: ServiceOrderStatus
  /** Optional note — a decline/cancel/dispute rationale. Surfaced to the other party. */
  reason?: string
  /** Only meaningful on a PENDING->ACCEPTED transition for a NEGOTIABLE order with no price yet. */
  agreedPrice?: number
  /** Optional reschedule, settable on any transition. */
  scheduledAt?: string
}

export interface CreateServiceReviewRequest {
  rating: number
  comment?: string
}

export interface ServiceMediaPresignRequest {
  filename: string
  /** Must match image/jpeg | image/png | image/webp. */
  contentType: string
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface ServiceFilters {
  category: string | null
  pricingType: ServicePricingType | null
  deliveryMode: ServiceDeliveryMode | null
  universityId: number | null
}

export const EMPTY_SERVICE_FILTERS: ServiceFilters = {
  category: null,
  pricingType: null,
  deliveryMode: null,
  universityId: null,
}

/** Staged for upload at submit time — a presigned PUT URL expires in a few minutes. */
export interface PendingServiceImage {
  file: File
  previewUrl: string
}

// ── Query keys ───────────────────────────────────────────────────────────────

/**
 * Every level is a valid invalidation prefix, so `serviceKeys.lists()` clears every filtered board
 * at once. Optional filter dimensions use the literal 'ALL' rather than undefined, which the query
 * hasher strips — `['services','mine',undefined]` and `['services','mine']` collide.
 */
export const serviceKeys = {
  all: ['services'] as const,

  lists: () => ['services', 'list'] as const,
  list: (filters: ServiceFilters) => ['services', 'list', filters] as const,
  searches: () => ['services', 'search'] as const,
  search: (q: string, category: string | 'ALL') => ['services', 'search', q, category] as const,

  mineAll: () => ['services', 'mine'] as const,
  mine: (status: ServiceListingStatus | 'ALL') => ['services', 'mine', status] as const,

  details: () => ['services', 'detail'] as const,
  detail: (listingId: number) => ['services', 'detail', listingId] as const,
  stats: (listingId: number) => ['services', 'stats', listingId] as const,
  reviewsForListing: (listingId: number) => ['services', 'reviews', 'listing', listingId] as const,

  ordersAll: () => ['services', 'orders'] as const,
  orderRosterAll: (listingId: number) => ['services', 'orders', 'roster', listingId] as const,
  orderRoster: (listingId: number, status: ServiceOrderStatus | 'ALL') =>
    ['services', 'orders', 'roster', listingId, status] as const,
  myOrdersAll: () => ['services', 'orders', 'mine'] as const,
  myOrders: (status: ServiceOrderStatus | 'ALL') => ['services', 'orders', 'mine', status] as const,
  receivedOrdersAll: () => ['services', 'orders', 'received'] as const,
  receivedOrders: (status: ServiceOrderStatus | 'ALL') => ['services', 'orders', 'received', status] as const,
  orderDetail: (orderId: number) => ['services', 'orders', 'detail', orderId] as const,
  orderReviews: (orderId: number) => ['services', 'orders', 'reviews', orderId] as const,
} as const
