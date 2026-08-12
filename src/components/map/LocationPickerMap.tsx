import { useEffect } from 'react'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import { Crosshair, Loader2, MapPin, X } from 'lucide-react'
import { MapCanvas } from './MapCanvas'
import { createPickerIcon } from './mapIcons'
import { useGeolocation } from '../../hooks/useGeolocation'
import { MAP_DEFAULT_CENTER, MAP_FOCUS_ZOOM, type LatLngTuple } from '../../lib/mapConfig'

interface LocationPickerMapProps {
  value: LatLngTuple | null
  onChange: (position: LatLngTuple | null) => void
  /** Rendered above the map; the field label supplies the real context. */
  hint?: string
  className?: string
  disabled?: boolean
}

/** Places the pin wherever the user taps. Rendered inside `MapContainer` so it can use its context. */
function ClickToPlace({ onChange, disabled }: Pick<LocationPickerMapProps, 'onChange' | 'disabled'>) {
  useMapEvents({
    click: (event) => {
      if (disabled) return
      onChange([event.latlng.lat, event.latlng.lng])
    },
  })
  return null
}

/**
 * Recentres when the pin moves somewhere the user cannot see — after a geolocation lookup, or when
 * an edit form loads a saved position. `panTo` rather than `setView` so an in-view nudge doesn't
 * jump the viewport out from under a drag.
 */
function FollowPin({ position }: { position: LatLngTuple | null }) {
  const map = useMap()

  useEffect(() => {
    if (!position) return
    if (!map.getBounds().contains(position)) map.panTo(position)
  }, [map, position])

  return null
}

/**
 * Click-to-place, drag-to-adjust location picker used for both coordinate pairs on the report form:
 * where the item was lost or found, and where it can be collected.
 *
 * The backend stores these as `DECIMAL(10,7)` and validates `@Digits(integer=3, fraction=7)`, so
 * coordinates are rounded to 7 places before they leave this component — a raw Leaflet latlng
 * carries full float precision and would be rejected with a 400.
 */
export function LocationPickerMap({
  value,
  onChange,
  hint,
  className = 'h-64',
  disabled = false,
}: Readonly<LocationPickerMapProps>) {
  const { position: geoPosition, error: geoError, isLoading, request } = useGeolocation()

  useEffect(() => {
    if (geoPosition) onChange(roundCoordinates(geoPosition))
    // `onChange` is excluded deliberately: callers pass an inline closure, and including it would
    // re-run this on every parent render and overwrite a pin the user has since dragged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoPosition])

  const handleChange = (next: LatLngTuple | null) => {
    onChange(next ? roundCoordinates(next) : null)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={request}
          disabled={disabled || isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#2D1F4D] px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-primary-50 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" />
          )}
          Use my current location
        </button>

        {value && !disabled && (
          <button
            type="button"
            onClick={() => handleChange(null)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-red-500 dark:text-gray-400"
          >
            <X className="h-3.5 w-3.5" />
            Clear pin
          </button>
        )}
      </div>

      {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}

      <div
        className={`${className} overflow-hidden rounded-2xl border border-gray-200 dark:border-[#2D1F4D] ${
          disabled ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        <MapCanvas
          center={value ?? MAP_DEFAULT_CENTER}
          zoom={value ? MAP_FOCUS_ZOOM : undefined}
          scrollWheelZoom={false}
        >
          <ClickToPlace onChange={handleChange} disabled={disabled} />
          <FollowPin position={value} />
          {value && (
            <Marker
              position={value}
              icon={createPickerIcon()}
              draggable={!disabled}
              eventHandlers={{
                dragend: (event) => {
                  const { lat, lng } = event.target.getLatLng()
                  handleChange([lat, lng])
                },
              }}
            />
          )}
        </MapCanvas>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        {value
          ? `Pinned at ${value[0].toFixed(5)}, ${value[1].toFixed(5)} — tap elsewhere or drag the pin to adjust.`
          : 'Tap the map to drop a pin.'}
      </p>

      {geoError && <p className="text-xs text-amber-600 dark:text-amber-400">{geoError}</p>}
    </div>
  )
}

/** `DECIMAL(10,7)` server-side; anything longer fails `@Digits(integer=3, fraction=7)` with a 400. */
function roundCoordinates([lat, lng]: LatLngTuple): LatLngTuple {
  return [Number(lat.toFixed(7)), Number(lng.toFixed(7))]
}
