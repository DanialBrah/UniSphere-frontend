import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import type { LatLngTuple } from '../../lib/mapConfig'

interface MapFitBoundsProps {
  points: LatLngTuple[]
  /** Keeps pins off the edge and clear of any floating panel. */
  padding?: [number, number]
  maxZoom?: number
}

/**
 * Frames the map around a set of points the first time a non-empty set arrives.
 *
 * Deliberately one-shot: refitting on every data change would yank the viewport back whenever a
 * pan triggers a refetch, which is exactly the interaction the map tab performs constantly. After
 * the first fit the user is in control.
 */
export function MapFitBounds({
  points,
  padding = [48, 48],
  maxZoom = 17,
}: Readonly<MapFitBoundsProps>) {
  const map = useMap()
  const hasFitted = useRef(false)

  useEffect(() => {
    if (hasFitted.current || points.length === 0) return
    hasFitted.current = true

    // fitBounds on a single point zooms to maxZoom, which is the sensible "focus here" behaviour.
    map.fitBounds(latLngBounds(points), { padding, maxZoom })
  }, [map, points, padding, maxZoom])

  return null
}
