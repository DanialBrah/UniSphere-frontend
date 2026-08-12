import { useEffect, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import type { LatLngBounds } from 'leaflet'

interface MapViewportWatcherProps {
  onBoundsChange: (bounds: LatLngBounds) => void
  /** Leaflet fires `moveend` once per gesture, but a flick-pan is several gestures. */
  debounceMs?: number
}

/**
 * Reports the visible viewport upward so a bounding-box query can follow the user around the map.
 *
 * This is what drives `GET /lost-found/items/map`, which takes minLat/maxLat/minLng/maxLng and has
 * no pagination — the client re-queries on pan instead. Debounced because a drag across campus
 * would otherwise fire a request per gesture.
 *
 * Renders nothing; it exists to run hooks inside `MapContainer`'s context.
 */
export function MapViewportWatcher({
  onBoundsChange,
  debounceMs = 400,
}: Readonly<MapViewportWatcherProps>) {
  const map = useMap()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // A ref, so changing the callback identity between renders never restarts a pending timer.
  const callbackRef = useRef(onBoundsChange)
  useEffect(() => {
    callbackRef.current = onBoundsChange
  }, [onBoundsChange])

  const schedule = (bounds: LatLngBounds) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => callbackRef.current(bounds), debounceMs)
  }

  useMapEvents({
    moveend: () => schedule(map.getBounds()),
    zoomend: () => schedule(map.getBounds()),
  })

  // Leaflet emits no event for the initial view, so the first fetch has to be kicked off here.
  useEffect(() => {
    callbackRef.current(map.getBounds())
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [map])

  return null
}
