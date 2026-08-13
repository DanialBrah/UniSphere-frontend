import type { LatLngBounds } from 'leaflet'
import type { LatLngTuple } from '../../../lib/mapConfig'
import type { MapBounds } from '../types'

/** Converts a Leaflet viewport into the four query params `/events/map` expects. */
export function boundsToMapBounds(bounds: LatLngBounds): MapBounds {
  const southWest = bounds.getSouthWest()
  const northEast = bounds.getNorthEast()

  return {
    // Clamped because Leaflet happily reports latitudes past the poles when zoomed out, and the
    // server rejects anything outside [-90, 90] with a 400.
    minLat: clamp(southWest.lat, -90, 90),
    maxLat: clamp(northEast.lat, -90, 90),
    minLng: clamp(southWest.lng, -180, 180),
    maxLng: clamp(northEast.lng, -180, 180),
  }
}

/**
 * The server rejects an inverted or antimeridian-crossing viewport with a 400. Leaflet produces
 * exactly that when the map is zoomed far enough out to wrap the globe, so the query is skipped
 * rather than sent — a campus map never legitimately spans the date line.
 */
export function isQueryableBounds(bounds: MapBounds): boolean {
  return bounds.minLat < bounds.maxLat && bounds.minLng < bounds.maxLng
}

/**
 * Rounded before it reaches a query key so a one-pixel pan doesn't mint a fresh cache entry.
 * Four decimals is ~11 m — far finer than any pan the debounce lets through.
 */
export function roundBounds(bounds: MapBounds): MapBounds {
  return {
    minLat: round(bounds.minLat, 4),
    maxLat: round(bounds.maxLat, 4),
    minLng: round(bounds.minLng, 4),
    maxLng: round(bounds.maxLng, 4),
  }
}

/** Both halves of a coordinate pair are required — the server 400s on a lone latitude. */
export function toLatLng(
  lat: number | null | undefined,
  lng: number | null | undefined,
): LatLngTuple | null {
  return lat != null && lng != null ? [lat, lng] : null
}

/** Metres under 1 km, one decimal above — the same shape the backend uses for distances. */
export function formatDistance(distanceKm: number): string {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return ''
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`
  return `${distanceKm.toFixed(1)} km away`
}

/** `DECIMAL(10,7)` server-side; more than 7 fraction digits fails `@Digits` with a 400. */
export function roundCoordinate(value: number): number {
  return round(value, 7)
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
