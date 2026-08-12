import { Fragment, useEffect, useState } from 'react'
import { Circle, Marker, Popup } from 'react-leaflet'
import type { LatLngBounds } from 'leaflet'
import { MapViewportWatcher } from '../../../components/map/MapViewportWatcher'
import { MapFitBounds } from '../../../components/map/MapFitBounds'
import { createItemIcon, FOUND_COLOR, LOST_COLOR } from '../../../components/map/mapIcons'
import { LostFoundMapPopup } from './LostFoundMapPopup'
import { useLostFoundMapPins } from '../hooks/useLostFoundMapPins'
import { APPROXIMATE_RADIUS_METERS, boundsToMapBounds } from '../utils/geo'
import type { LatLngTuple } from '../../../lib/mapConfig'
import type { LostFoundMapPinResponse, MapBounds, MapFilters } from '../types'

export interface MapLayerStatus {
  count: number
  isLoading: boolean
  isError: boolean
  /** The server truncated the viewport at its 500-pin cap. */
  isCapped: boolean
}

interface LostFoundMapLayerProps {
  filters: MapFilters
  /** Lets the host page render the count, the loading spinner and the cap banner outside the map. */
  onStatusChange?: (status: MapLayerStatus) => void
  /** Frames the map on the first non-empty result. Off on /map, which has its own default view. */
  fitToPins?: boolean
}

/**
 * The Lost & Found pin layer, rendered inside a `MapCanvas`.
 *
 * Extracted from any one page because it has two homes: the Map tab on `/lost-found` and the
 * Lost & Found layer on the `/map` campus map. Both want identical pins, popups and privacy
 * affordances, and neither should own the bbox-query plumbing.
 */
export function LostFoundMapLayer({
  filters,
  onStatusChange,
  fitToPins = true,
}: Readonly<LostFoundMapLayerProps>) {
  const [bounds, setBounds] = useState<MapBounds | null>(null)
  const { data, isFetching, isError, isCapped } = useLostFoundMapPins(bounds, filters)

  const pins = data ?? []

  useEffect(() => {
    onStatusChange?.({ count: pins.length, isLoading: isFetching, isError, isCapped })
    // `pins` is a fresh array identity on every render; its length is the only part that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins.length, isFetching, isError, isCapped])

  const positions: LatLngTuple[] = pins
    .filter(hasPosition)
    .map((pin) => [pin.latitude, pin.longitude])

  return (
    <>
      <MapViewportWatcher
        onBoundsChange={(next: LatLngBounds) => setBounds(boundsToMapBounds(next))}
      />
      {fitToPins && <MapFitBounds points={positions} />}

      {pins.filter(hasPosition).map((pin) => {
        const color = pin.itemType === 'LOST' ? LOST_COLOR : FOUND_COLOR
        const position: LatLngTuple = [pin.latitude, pin.longitude]

        return (
          // A Fragment, not a wrapper element: react-leaflet components attach to the Leaflet map
          // imperatively and render null, so a <div> here would inject a stray empty node into the
          // map container that can swallow pointer events.
          <Fragment key={pin.id}>
            {/*
              The circle is what makes the privacy guard legible. A FOUND item's coordinates are
              rounded to ~1.1 km for anyone without an approved claim, so a bare pin would simply
              sit in the wrong place and read as a bug. Drawn beneath the marker so it never
              intercepts the click.
            */}
            {pin.coordinatesApproximate && (
              <Circle
                center={position}
                radius={APPROXIMATE_RADIUS_METERS}
                interactive={false}
                pathOptions={{
                  color,
                  weight: 1.5,
                  dashArray: '6 5',
                  fillColor: color,
                  fillOpacity: 0.08,
                }}
              />
            )}

            <Marker
              position={position}
              icon={createItemIcon({
                color,
                category: pin.category,
                approximate: pin.coordinatesApproximate,
                muted: pin.status !== 'OPEN' && pin.status !== 'CLAIMED',
              })}
              // Colour alone never carries the meaning: the pin's glyph varies by category and the
              // accessible name spells out the type in words for screen readers.
              alt={`${pin.itemType === 'LOST' ? 'Lost' : 'Found'} item: ${pin.title}`}
            >
              <Popup>
                <LostFoundMapPopup pin={pin} />
              </Popup>
            </Marker>
          </Fragment>
        )
      })}
    </>
  )
}

/** Items reported without coordinates are legitimate — they just can't be drawn. */
function hasPosition(
  pin: LostFoundMapPinResponse,
): pin is LostFoundMapPinResponse & { latitude: number; longitude: number } {
  return pin.latitude != null && pin.longitude != null
}
