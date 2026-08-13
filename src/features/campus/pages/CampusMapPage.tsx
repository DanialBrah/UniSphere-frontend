import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bus, CalendarDays, Layers, Loader2, PackageSearch, Plus, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { MapCanvas } from '../../../components/map/MapCanvas'
import {
  LostFoundMapLayer,
  type MapLayerStatus,
} from '../../lostfound/components/LostFoundMapLayer'
import { LostFoundMapLegend } from '../../lostfound/components/LostFoundMapLegend'
import { MAP_PIN_CAP } from '../../lostfound/hooks/useLostFoundMapPins'
import { STATUS_LABEL, TYPE_LABEL, TYPE_ORDER } from '../../lostfound/utils/display'
import type { LostFoundItemStatus, MapFilters } from '../../lostfound/types'
import {
  EventsMapLayer,
  type EventMapLayerStatus,
} from '../../events/components/EventsMapLayer'
import { EventsMapLegend } from '../../events/components/EventsMapLegend'
import { MAP_PIN_CAP as EVENT_MAP_PIN_CAP } from '../../events/hooks/useEventMapPins'
import { CATEGORY_LABEL as EVENT_CATEGORY_LABEL, CATEGORY_ORDER as EVENT_CATEGORY_ORDER } from '../../events/utils/display'
import type { EventMapFilters } from '../../events/types'

const CHIP_BASE =
  'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

const MAP_STATUSES: LostFoundItemStatus[] = ['OPEN', 'CLAIMED', 'RESOLVED']

const INITIAL_STATUS: MapLayerStatus = {
  count: 0,
  isLoading: true,
  isError: false,
  isCapped: false,
}

const INITIAL_EVENT_STATUS: EventMapLayerStatus = {
  count: 0,
  isLoading: true,
  isError: false,
  isCapped: false,
}

/**
 * The campus map.
 *
 * Ships with two live layers: Lost & Found and Events. Buildings/facilities has no backend
 * controller yet, so that's the one placeholder row left saying so rather than leaving the page
 * looking unfinished.
 */
export default function CampusMapPage() {
  const [showLostFound, setShowLostFound] = useState(true)
  const [filters, setFilters] = useState<MapFilters>({ type: null, status: 'OPEN' })
  const [status, setStatus] = useState<MapLayerStatus>(INITIAL_STATUS)

  const [showEvents, setShowEvents] = useState(true)
  const [eventFilters, setEventFilters] = useState<EventMapFilters>({ category: null })
  const [eventStatus, setEventStatus] = useState<EventMapLayerStatus>(INITIAL_EVENT_STATUS)

  const handleStatusChange = useCallback((next: MapLayerStatus) => setStatus(next), [])
  const handleEventStatusChange = useCallback((next: EventMapLayerStatus) => setEventStatus(next), [])

  return (
    <DashboardLayout>
      {/*
        The layout puts pages inside `<main className="flex-1 overflow-y-auto">`, so a
        percentage-height MapContainer would collapse. This wrapper gives it a definite box.
      */}
      <div className="flex h-full min-h-0 flex-col gap-4 p-6 lg:p-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Campus map</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Everything happening around campus, pinned where it happened.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/events/new"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-primary-50"
            >
              <CalendarDays className="h-4 w-4" />
              Create event
            </Link>
            <Link
              to="/lost-found/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Report an item
            </Link>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <aside className="w-full shrink-0 space-y-3 lg:w-64">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                <Layers className="h-4 w-4 text-primary" />
                Layers
              </h2>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5">
                <input
                  type="checkbox"
                  checked={showLostFound}
                  onChange={(e) => setShowLostFound(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                <PackageSearch className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Lost &amp; Found</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5">
                <input
                  type="checkbox"
                  checked={showEvents}
                  onChange={(e) => setShowEvents(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Events</span>
              </label>

              {/* Disabled, not hidden: a map with only two checkboxes reads as unfinished. */}
              {[{ icon: Bus, label: 'Bus stops' }].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex cursor-not-allowed items-center gap-2.5 px-1 py-1.5 opacity-50"
                >
                  <input type="checkbox" disabled className="h-4 w-4 rounded" />
                  <Icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="ml-auto text-[10px] text-gray-400">Soon</span>
                </div>
              ))}
            </div>

            {showLostFound && (
              <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Filter items
                </h3>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilters({ ...filters, type: null })}
                    className={`${CHIP_BASE} ${filters.type === null ? CHIP_ACTIVE : CHIP_IDLE}`}
                  >
                    All
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
                </div>

                <div className="flex flex-wrap gap-1.5">
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

                <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {status.isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {status.isError ? (
                    <span className="flex items-center gap-1.5 text-red-500">
                      <TriangleAlert className="h-3.5 w-3.5" />
                      Couldn&apos;t load pins
                    </span>
                  ) : (
                    <>
                      {status.count} {status.count === 1 ? 'item' : 'items'} in view
                    </>
                  )}
                </p>

                {status.isCapped && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    Showing the first {MAP_PIN_CAP}. Zoom in to narrow.
                  </p>
                )}

                <LostFoundMapLegend />
              </div>
            )}

            {showEvents && (
              <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Filter events
                </h3>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setEventFilters({ category: null })}
                    className={`${CHIP_BASE} ${eventFilters.category === null ? CHIP_ACTIVE : CHIP_IDLE}`}
                  >
                    All
                  </button>
                  {EVENT_CATEGORY_ORDER.map((category) => {
                    const active = eventFilters.category === category
                    return (
                      <button
                        key={category}
                        onClick={() => setEventFilters({ category: active ? null : category })}
                        className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
                      >
                        {EVENT_CATEGORY_LABEL[category]}
                      </button>
                    )
                  })}
                </div>

                <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {eventStatus.isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {eventStatus.isError ? (
                    <span className="flex items-center gap-1.5 text-red-500">
                      <TriangleAlert className="h-3.5 w-3.5" />
                      Couldn&apos;t load pins
                    </span>
                  ) : (
                    <>
                      {eventStatus.count} {eventStatus.count === 1 ? 'event' : 'events'} in view
                    </>
                  )}
                </p>

                {eventStatus.isCapped && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    Showing the first {EVENT_MAP_PIN_CAP}. Zoom in to narrow.
                  </p>
                )}

                <EventsMapLegend />
              </div>
            )}
          </aside>

          <div className="min-h-[420px] flex-1 overflow-hidden rounded-2xl">
            <MapCanvas>
              {showLostFound && (
                <LostFoundMapLayer
                  filters={filters}
                  onStatusChange={handleStatusChange}
                  // The campus map opens on the campus, not wherever the first pins happen to be.
                  fitToPins={false}
                />
              )}
              {showEvents && (
                <EventsMapLayer
                  filters={eventFilters}
                  onStatusChange={handleEventStatusChange}
                  fitToPins={false}
                />
              )}
            </MapCanvas>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
