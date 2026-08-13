import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { eventApi } from '../api/eventApi'
import { isQueryableBounds, roundBounds } from '../utils/geo'
import { eventKeys } from '../types'
import type { EventMapFilters, MapBounds } from '../types'

/**
 * The server's hard cap on pins per viewport (`events.map-max-pins`). When a response is exactly
 * this long the result was truncated, and the map says so rather than pretending it is showing
 * everything.
 */
export const MAP_PIN_CAP = 500

/**
 * Viewport-driven pin query.
 *
 * `/events/map` has no pagination — the contract is that the client re-queries as the user pans.
 * Three things make that tolerable:
 *  - bounds are rounded to 4 dp (~11 m) before they reach the query key, so a sub-pixel jitter
 *    doesn't mint a new cache entry;
 *  - `keepPreviousData` holds the old pins on screen while the new ones load, instead of blanking
 *    the map on every pan;
 *  - an inverted or antimeridian-crossing viewport is skipped rather than sent, because the server
 *    rejects it with a 400 and Leaflet produces exactly that when zoomed far enough out.
 */
export function useEventMapPins(bounds: MapBounds | null, filters: EventMapFilters) {
  const rounded = bounds ? roundBounds(bounds) : null
  const isEnabled = rounded != null && isQueryableBounds(rounded)

  const query = useQuery({
    queryKey: eventKeys.map(rounded ?? { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }, filters),
    queryFn: () => eventApi.getMapPins(rounded as MapBounds, filters),
    enabled: isEnabled,
    placeholderData: keepPreviousData,
  })

  return {
    ...query,
    /** True when the server truncated the result — the UI prompts the user to zoom in. */
    isCapped: (query.data?.length ?? 0) >= MAP_PIN_CAP,
  }
}
