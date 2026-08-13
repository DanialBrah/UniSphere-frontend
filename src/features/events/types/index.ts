import type { ApiResponse } from '../../identity/types/auth'
import type { SpringPage } from '../../social/types'

export type { ApiResponse, SpringPage }

// String-literal unions rather than TS enums — tsconfig sets `erasableSyntaxOnly`.
export type EventCategory =
  | 'ACADEMIC'
  | 'CAREER'
  | 'WORKSHOP'
  | 'SOCIAL'
  | 'SPORTS'
  | 'CULTURAL'
  | 'TECH'
  | 'CLUB'
  | 'ORIENTATION'
  | 'OTHER'

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
export type EventRegistrationMode = 'INTERNAL' | 'EXTERNAL'
export type EventRegistrationStatus = 'REGISTERED' | 'WAITLISTED' | 'CANCELLED' | 'ATTENDED'

/** The only statuses a client may ever request in `PATCH /events/{id}/status`. `COMPLETED` is system-only. */
export type EventUserStatusTarget = Extract<EventStatus, 'PUBLISHED' | 'CANCELLED'>

// ── Responses ────────────────────────────────────────────────────────────────

export interface EventOrganizerResponse {
  id: number
  displayName: string
  /** Presigned GET URL — expires after ~60 minutes. Never persist it. */
  avatarUrl: string | null
  role: string
}

/**
 * Full detail view. Unlike Lost & Found, nothing here is masked by viewer — event locations are
 * meant to be public and promotional, so latitude/longitude/venueName are always exact.
 */
export interface EventResponse {
  id: number
  organizer: EventOrganizerResponse
  category: EventCategory
  status: EventStatus
  title: string
  description: string | null
  /** Presigned GET URL, not the bare key. */
  coverImageUrl: string | null
  startDatetime: string
  endDatetime: string
  online: boolean
  onlineUrl: string | null
  venueName: string | null
  latitude: number | null
  longitude: number | null
  registrationMode: EventRegistrationMode
  externalRegistrationUrl: string | null
  maxCapacity: number | null
  registeredCount: number
  waitlistedCount: number
  /** `maxCapacity - registeredCount`, or null when unlimited. */
  availableSeats: number | null
  /** Null means visible to everyone (an Employer/Admin organizer has no university affiliation). */
  universityId: number | null
  /** The caller's own registration status on this event, or null if they have none. Saves a round trip. */
  viewerRegistrationStatus: EventRegistrationStatus | null
  /** Whether the caller may edit, change status or delete this event. */
  canModify: boolean
  createdAt: string
  updatedAt: string
}

/** List/feed/search/nearby/me projection. Drops description, onlineUrl and updatedAt. */
export interface EventSummaryResponse {
  id: number
  organizer: EventOrganizerResponse
  category: EventCategory
  status: EventStatus
  title: string
  coverImageUrl: string | null
  startDatetime: string
  endDatetime: string
  online: boolean
  venueName: string | null
  latitude: number | null
  longitude: number | null
  registrationMode: EventRegistrationMode
  externalRegistrationUrl: string | null
  maxCapacity: number | null
  registeredCount: number
  waitlistedCount: number
  availableSeats: number | null
  universityId: number | null
  viewerRegistrationStatus: EventRegistrationStatus | null
  canModify: boolean
  createdAt: string
}

/** A wrapper rather than a nullable field on the summary, which would be null on six of seven endpoints. */
export interface EventNearbyResponse {
  event: EventSummaryResponse
  distanceKm: number
}

/** The minimum a map needs to draw one marker. Always `status === 'PUBLISHED'`. */
export interface EventMapPinResponse {
  id: number
  title: string
  category: EventCategory
  status: EventStatus
  startDatetime: string
  latitude: number | null
  longitude: number | null
  coverImageUrl: string | null
  maxCapacity: number | null
  registeredCount: number
}

export interface EventRegistrationResponse {
  id: number
  eventId: number
  /** May be null in edge cases (e.g. a title lookup miss). */
  eventTitle: string | null
  userId: number
  /** The registrant's display info — reuses `EventOrganizerResponse`'s shape, not a duplicate type. */
  attendee: EventOrganizerResponse
  status: EventRegistrationStatus
  /** A bare scannable string — turning it into a QR image is a client-side concern. */
  ticketCode: string
  checkedInAt: string | null
  /** Who cancelled this — compare against `userId` to tell a self-cancel from an organizer/admin removal. */
  cancelledBy: number | null
  /** Optional note left by whoever cancelled it — most meaningful when an organizer removed someone. */
  cancellationReason: string | null
  cancelledAt: string | null
  createdAt: string
}

/**
 * The live seat-count broadcast payload pushed to `/topic/events/{eventId}/seats`. Raw — NOT
 * wrapped in `ApiResponse<T>`, don't run it through the usual `unwrap` helper.
 */
export interface EventSeatsResponse {
  eventId: number
  registeredCount: number
  maxCapacity: number | null
  availableSeats: number | null
  waitlistedCount: number
}

/** Organizer/ADMIN-only per-event breakdown — `GET /events/{id}/stats`. */
export interface EventStatsResponse {
  registeredCount: number
  waitlistedCount: number
  attendedCount: number
  cancelledCount: number
  maxCapacity: number | null
  availableSeats: number | null
}

export interface EventMediaPresignResponse {
  uploadUrl: string
  mediaKey: string
}

export interface EventMediaUploadResponse {
  mediaKey: string
  mediaUrl: string
}

// ── Requests ─────────────────────────────────────────────────────────────────

export interface CreateEventRequest {
  title: string
  description?: string
  category?: EventCategory
  /** Naive ISO local date-time, e.g. `2026-08-05T14:30:00`. Must be in the future. */
  startDatetime: string
  /** Must be strictly after startDatetime. */
  endDatetime: string
  coverImageKey?: string
  online: boolean
  onlineUrl?: string
  venueName?: string
  latitude?: number
  longitude?: number
  registrationMode: EventRegistrationMode
  externalRegistrationUrl?: string
  /** Positive; omitted/undefined means unlimited. Forbidden when registrationMode is EXTERNAL. */
  maxCapacity?: number
}

/** PUT, but PATCH-like: an omitted field is untouched, a blank string clears a nullable text field. */
export interface UpdateEventRequest {
  category?: EventCategory
  title?: string
  description?: string
  startDatetime?: string
  endDatetime?: string
  coverImageKey?: string
  online?: boolean
  onlineUrl?: string
  venueName?: string
  latitude?: number
  longitude?: number
  /** True clears venueName+latitude+longitude. Ignored when venueName/latitude are also supplied. */
  clearLocation?: boolean
  registrationMode?: EventRegistrationMode
  externalRegistrationUrl?: string
  maxCapacity?: number
  /** True resets maxCapacity to unlimited. Ignored when maxCapacity is also supplied. */
  clearMaxCapacity?: boolean
}

export interface EventStatusUpdateRequest {
  status: EventUserStatusTarget
}

export interface EventRegistrationStatusUpdateRequest {
  /** Only `CANCELLED` is ever accepted here — ATTENDED is set via check-in, REGISTERED via auto-promotion. */
  status: Extract<EventRegistrationStatus, 'CANCELLED'>
  /** Optional note, e.g. an organizer explaining why an attendee was removed. Max 255 chars. */
  reason?: string
}

export interface EventCheckInRequest {
  ticketCode: string
}

export interface EventMediaPresignRequest {
  filename: string
  /** Must match `image/(jpeg|png|gif|webp)` — events accept images only, no video. */
  contentType: string
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface EventFilters {
  category: EventCategory | null
  /** Never `DRAFT` — GET / 400s on status=DRAFT, and omitted defaults server-side to PUBLISHED anyway. */
  status: Extract<EventStatus, 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'> | null
  isOnline: boolean | null
}

export const EMPTY_EVENT_FILTERS: EventFilters = {
  category: null,
  status: null,
  isOnline: null,
}

/** `/events/map` takes only a category — it always returns PUBLISHED-only pins. */
export interface EventMapFilters {
  category: EventCategory | null
}

export const EMPTY_EVENT_MAP_FILTERS: EventMapFilters = { category: null }

/** `/events/map` takes a bounding box and returns an unpaginated, server-capped list. */
export interface MapBounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

/** Staged upload: the File plus its object URL. Uploaded at submit, since presigns expire in ~5 min. */
export interface PendingEventCover {
  file: File
  previewUrl: string
}

// ── Query keys ───────────────────────────────────────────────────────────────

/**
 * Every level is a valid invalidation prefix, so `eventKeys.lists()` clears every filtered board at
 * once. Optional statuses use the literal `'ALL'` rather than `undefined`, which the query hasher
 * strips — `['events','mine',undefined]` and `['events','mine']` collide.
 */
export const eventKeys = {
  all: ['events'] as const,

  lists: () => ['events', 'list'] as const,
  list: (filters: EventFilters) => ['events', 'list', filters] as const,
  searches: () => ['events', 'search'] as const,
  search: (q: string, category: EventCategory | 'ALL') => ['events', 'search', q, category] as const,

  maps: () => ['events', 'map'] as const,
  map: (bounds: MapBounds, filters: EventMapFilters) => ['events', 'map', bounds, filters] as const,
  nearby: (lat: number, lng: number, radiusKm: number, category: EventCategory | 'ALL') =>
    ['events', 'nearby', lat, lng, radiusKm, category] as const,

  mineAll: () => ['events', 'mine'] as const,
  mine: (status: EventStatus | 'ALL') => ['events', 'mine', status] as const,

  details: () => ['events', 'detail'] as const,
  detail: (eventId: number) => ['events', 'detail', eventId] as const,
  stats: (eventId: number) => ['events', 'stats', eventId] as const,

  registrationsAll: () => ['events', 'registrations'] as const,
  roster: (eventId: number, status: EventRegistrationStatus | 'ALL') =>
    ['events', 'registrations', 'roster', eventId, status] as const,
  rosterAll: (eventId: number) => ['events', 'registrations', 'roster', eventId] as const,
  myRegistration: (eventId: number) => ['events', 'registrations', 'mine', eventId] as const,
  myTicketsAll: () => ['events', 'registrations', 'tickets'] as const,
  myTickets: (status: EventRegistrationStatus | 'ALL') =>
    ['events', 'registrations', 'tickets', status] as const,
} as const
