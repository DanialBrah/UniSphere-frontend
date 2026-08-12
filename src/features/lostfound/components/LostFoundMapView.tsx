import { useCallback, useState } from 'react'
import { Loader2, TriangleAlert } from 'lucide-react'
import { MapCanvas } from '../../../components/map/MapCanvas'
import { LostFoundMapLayer, type MapLayerStatus } from './LostFoundMapLayer'
import { LostFoundMapLegend } from './LostFoundMapLegend'
import { MAP_PIN_CAP } from '../hooks/useLostFoundMapPins'
import { STATUS_LABEL, TYPE_LABEL, TYPE_ORDER } from '../utils/display'
import type { LostFoundItemStatus, MapFilters } from '../types'

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

/** `/items/map` accepts only type and status — category is not a parameter of that endpoint. */
const MAP_STATUSES: LostFoundItemStatus[] = ['OPEN', 'CLAIMED', 'RESOLVED']

const INITIAL_STATUS: MapLayerStatus = {
  count: 0,
  isLoading: true,
  isError: false,
  isCapped: false,
}

/**
 * The Map tab on `/lost-found`: filter chips, the pin layer, a legend and a live result count.
 *
 * Kept separate from `LostFoundMapLayer` so `/map` can mount the layer inside its own campus map
 * chrome without inheriting this page's filter bar.
 */
export function LostFoundMapView({ className = 'h-[65vh]' }: Readonly<{ className?: string }>) {
  const [filters, setFilters] = useState<MapFilters>({ type: null, status: 'OPEN' })
  const [status, setStatus] = useState<MapLayerStatus>(INITIAL_STATUS)

  // Stable identity — the layer holds this in a ref and a new closure each render would be noise.
  const handleStatusChange = useCallback((next: MapLayerStatus) => setStatus(next), [])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilters({ ...filters, type: null })}
          className={`${CHIP_BASE} ${filters.type === null ? CHIP_ACTIVE : CHIP_IDLE}`}
        >
          All items
        </button>
        {TYPE_ORDER.map((type) => {
          const active = filters.type === type
          return (
            <button
              key={type}
              onClick={() => setFilters({ ...filters, type: active ? null : type })}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {TYPE_LABEL[type]}
            </button>
          )
        })}

        <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-[#2D1F4D]" />

        {MAP_STATUSES.map((value) => {
          const active = filters.status === value
          return (
            <button
              key={value}
              onClick={() => setFilters({ ...filters, status: active ? null : value })}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {STATUS_LABEL[value]}
            </button>
          )
        })}
      </div>

      <div className={`${className} w-full overflow-hidden rounded-2xl`}>
        <MapCanvas>
          <LostFoundMapLayer filters={filters} onStatusChange={handleStatusChange} />
        </MapCanvas>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <LostFoundMapLegend />

        <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          {status.isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {status.isError ? (
            <span className="flex items-center gap-1.5 text-red-500">
              <TriangleAlert className="h-3.5 w-3.5" />
              Couldn&apos;t load pins for this area
            </span>
          ) : (
            <>
              {status.count} {status.count === 1 ? 'item' : 'items'} in view
            </>
          )}
        </p>
      </div>

      {/*
        `/items/map` is hard-capped at 500 pins server-side with no pagination. Saying so is more
        honest than silently showing a partial map, and zooming in is the actual remedy.
      */}
      {status.isCapped && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Showing the first {MAP_PIN_CAP} items in this area. Zoom in to narrow the results.
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Items reported without a location pin don&apos;t appear on the map — check the Browse tab
        for the full list.
      </p>
    </div>
  )
}
