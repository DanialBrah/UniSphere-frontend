import { useCallback, useState } from 'react'
import { Loader2, TriangleAlert } from 'lucide-react'
import { MapCanvas } from '../../../components/map/MapCanvas'
import { EventsMapLayer, type EventMapLayerStatus } from './EventsMapLayer'
import { EventsMapLegend } from './EventsMapLegend'
import { MAP_PIN_CAP } from '../hooks/useEventMapPins'
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../utils/display'
import type { EventMapFilters } from '../types'

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

const INITIAL_STATUS: EventMapLayerStatus = {
  count: 0,
  isLoading: true,
  isError: false,
  isCapped: false,
}

/**
 * The Map tab on `/events`: category chips, the pin layer, a legend and a live result count.
 *
 * `/events/map` only ever returns PUBLISHED events, so there's nothing to filter beyond category —
 * unlike Lost & Found's map, which also filters by status.
 *
 * Kept separate from `EventsMapLayer` so `/map` can mount the layer inside its own campus-map chrome
 * without inheriting this page's filter bar.
 */
export function EventsMapView({ className = 'h-[65vh]' }: Readonly<{ className?: string }>) {
  const [filters, setFilters] = useState<EventMapFilters>({ category: null })
  const [status, setStatus] = useState<EventMapLayerStatus>(INITIAL_STATUS)

  // Stable identity — the layer holds this in a ref and a new closure each render would be noise.
  const handleStatusChange = useCallback((next: EventMapLayerStatus) => setStatus(next), [])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setFilters({ category: null })}
          className={`${CHIP_BASE} ${filters.category === null ? CHIP_ACTIVE : CHIP_IDLE}`}
        >
          All categories
        </button>
        {CATEGORY_ORDER.map((category) => {
          const active = filters.category === category
          return (
            <button
              key={category}
              onClick={() => setFilters({ category: active ? null : category })}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {CATEGORY_LABEL[category]}
            </button>
          )
        })}
      </div>

      <div className={`${className} w-full overflow-hidden rounded-2xl`}>
        <MapCanvas>
          <EventsMapLayer filters={filters} onStatusChange={handleStatusChange} />
        </MapCanvas>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <EventsMapLegend />

        <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          {status.isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {status.isError ? (
            <span className="flex items-center gap-1.5 text-red-500">
              <TriangleAlert className="h-3.5 w-3.5" />
              Couldn&apos;t load pins for this area
            </span>
          ) : (
            <>
              {status.count} {status.count === 1 ? 'event' : 'events'} in view
            </>
          )}
        </p>
      </div>

      {status.isCapped && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Showing the first {MAP_PIN_CAP} events in this area. Zoom in to narrow the results.
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Online-only events don&apos;t appear on the map — check the Browse tab for the full list.
      </p>
    </div>
  )
}
