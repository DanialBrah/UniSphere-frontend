import { Fragment, useEffect, useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import type { LatLngBounds } from 'leaflet'
import { MapViewportWatcher } from '../../../components/map/MapViewportWatcher'
import { MapFitBounds } from '../../../components/map/MapFitBounds'
import { createEventIcon } from '../../../components/map/mapIcons'
import { EventsMapPopup } from './EventsMapPopup'
import { useEventMapPins } from '../hooks/useEventMapPins'
import { boundsToMapBounds } from '../utils/geo'
import type { LatLngTuple } from '../../../lib/mapConfig'
import type { EventMapFilters, EventMapPinResponse, MapBounds } from '../types'

export interface EventMapLayerStatus {
  count: number
  isLoading: boolean
  isError: boolean
  /** The server truncated the viewport at its pin cap. */
  isCapped: boolean
}

interface EventsMapLayerProps {
  filters: EventMapFilters
  /** Lets the host page render the count, the loading spinner and the cap banner outside the map. */
  onStatusChange?: (status: EventMapLayerStatus) => void
  /** Frames the map on the first non-empty result. Off on /map, which has its own default view. */
  fitToPins?: boolean
}

/**
 * The Events pin layer, rendered inside a `MapCanvas`.
 *
 * Structurally identical to `LostFoundMapLayer` — same viewport-watcher -> bbox-query -> marker
 * pattern — minus the privacy-approximation `<Circle>` (event coordinates are never coarsened) and
 * minus a `muted` icon variant (`/events/map` only ever returns PUBLISHED pins). Has two homes: the
 * Map tab on `/events` and the Events layer on the `/map` campus map.
 */
export function EventsMapLayer({
  filters,
  onStatusChange,
  fitToPins = true,
}: Readonly<EventsMapLayerProps>) {
  const [bounds, setBounds] = useState<MapBounds | null>(null)
  const { data, isFetching, isError, isCapped } = useEventMapPins(bounds, filters)

  const pins = data ?? []

  useEffect(() => {
    onStatusChange?.({ count: pins.length, isLoading: isFetching, isError, isCapped })
    // `pins` is a fresh array identity on every render; its length is the only part that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins.length, isFetching, isError, isCapped])

  const positions: LatLngTuple[] = pins.filter(hasPosition).map((pin) => [pin.latitude, pin.longitude])

  return (
    <>
      <MapViewportWatcher
        onBoundsChange={(next: LatLngBounds) => setBounds(boundsToMapBounds(next))}
      />
      {fitToPins && <MapFitBounds points={positions} />}

      {pins.filter(hasPosition).map((pin) => {
        const position: LatLngTuple = [pin.latitude, pin.longitude]

        return (
          // A Fragment, not a wrapper element: react-leaflet components attach to the Leaflet map
          // imperatively and render null, so a <div> here would inject a stray empty node into the
          // map container that can swallow pointer events.
          <Fragment key={pin.id}>
            <Marker
              position={position}
              icon={createEventIcon(pin.category)}
              alt={`Event: ${pin.title}`}
            >
              <Popup>
                <EventsMapPopup pin={pin} />
              </Popup>
            </Marker>
          </Fragment>
        )
      })}
    </>
  )
}

/** Online-only events have no coordinates and legitimately can't be drawn. */
function hasPosition(
  pin: EventMapPinResponse,
): pin is EventMapPinResponse & { latitude: number; longitude: number } {
  return pin.latitude != null && pin.longitude != null
}
