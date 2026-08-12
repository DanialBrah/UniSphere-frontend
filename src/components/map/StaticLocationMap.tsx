import { Circle, Marker } from 'react-leaflet'
import type { DivIcon } from 'leaflet'
import { MapCanvas } from './MapCanvas'
import { MAP_FOCUS_ZOOM, type LatLngTuple } from '../../lib/mapConfig'

interface StaticLocationMapProps {
  position: LatLngTuple
  icon: DivIcon
  /** Draws the uncertainty circle that makes a coarsened coordinate honest rather than wrong. */
  approximateRadiusMeters?: number
  /** Match the circle to the item type so the two read as one object. */
  accentColor?: string
  className?: string
  zoom?: number
}

/**
 * A single, non-interactive pin — used on the item detail page for the incident and pickup points.
 *
 * Panning and zooming are off because there is nothing else on the map to navigate to; the map tab
 * is where exploration happens. Dragging a one-pin map only ever loses the pin.
 */
export function StaticLocationMap({
  position,
  icon,
  approximateRadiusMeters,
  accentColor = '#7C3AED',
  className = 'h-48',
  zoom = MAP_FOCUS_ZOOM,
}: Readonly<StaticLocationMapProps>) {
  return (
    <div
      className={`${className} overflow-hidden rounded-2xl border border-gray-200 dark:border-[#2D1F4D] [&_.leaflet-container]:cursor-default`}
    >
      <MapCanvas center={position} zoom={zoom} interactive={false}>
        {approximateRadiusMeters != null && (
          <Circle
            center={position}
            radius={approximateRadiusMeters}
            pathOptions={{
              color: accentColor,
              weight: 1.5,
              dashArray: '6 5',
              fillColor: accentColor,
              fillOpacity: 0.1,
            }}
          />
        )}
        <Marker position={position} icon={icon} interactive={false} keyboard={false} />
      </MapCanvas>
    </div>
  )
}
