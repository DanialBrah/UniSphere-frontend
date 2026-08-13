import { lazy, Suspense, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Plus } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { EventBoard } from '../components/EventBoard'
import { EventFilterBar } from '../components/EventFilterBar'
import { MyTicketsList } from '../components/MyTicketsList'
import {
  isSearchableEventQuery,
  useEventFeed,
  useEventSearch,
  useMyEvents,
} from '../hooks/useEventQueries'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { EMPTY_EVENT_FILTERS } from '../types'
import type { EventFilters, EventSummaryResponse, SpringPage } from '../types'

/**
 * Leaflet plus react-leaflet is ~150 KB. Lazily loading the map tab keeps it out of the chunk for
 * the majority of visits, which never leave the Browse list — same precedent as Lost & Found.
 */
const EventsMapView = lazy(() =>
  import('../components/EventsMapView').then((m) => ({ default: m.EventsMapView })),
)

const TABS = [
  { id: 'browse', label: 'Browse' },
  { id: 'map', label: 'Map' },
  { id: 'mine', label: 'My events' },
  { id: 'tickets', label: 'My tickets' },
] as const

type TabId = (typeof TABS)[number]['id']

function isTabId(value: string | null): value is TabId {
  return TABS.some((tab) => tab.id === value)
}

const flatten = (
  data?: InfiniteData<SpringPage<EventSummaryResponse>>,
): EventSummaryResponse[] => data?.pages.flatMap((page) => page.content) ?? []

export default function EventsBoardPage() {
  const navigate = useNavigate()
  // The tab lives in the URL so a map view is linkable and survives a refresh.
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('view')
  const activeTab: TabId = isTabId(tabParam) ? tabParam : 'browse'

  const [filters, setFilters] = useState<EventFilters>(EMPTY_EVENT_FILTERS)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const isSearching = isSearchableEventQuery(debouncedSearch)

  const isBrowse = activeTab === 'browse'
  const feed = useEventFeed(filters, isBrowse && !isSearching)
  const searchResults = useEventSearch(debouncedSearch, filters.category)
  const myEvents = useMyEvents(null, activeTab === 'mine')

  const browseQuery = isSearching ? searchResults : feed
  const listItems = flatten(browseQuery.data)

  const setTab = (tab: TabId) => {
    setSearchParams(tab === 'browse' ? {} : { view: tab }, { replace: true })
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl p-6 lg:p-8">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Events</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Create an event, or register for one — in-app or on the organizer&apos;s own site.
            </p>
          </div>

          <button
            onClick={() => navigate('/events/new')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Create event
          </button>
        </header>

        <nav
          aria-label="Events views"
          className="mb-5 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200 dark:border-[#2D1F4D]"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={[
                '-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-primary dark:text-gray-400',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'browse' && (
          <>
            <EventFilterBar
              filters={filters}
              onChange={setFilters}
              search={search}
              onSearchChange={setSearch}
              // Category and time aren't parameters of /events/search, so hide the rows rather than
              // render controls that would silently do nothing.
              showFilterRows={!isSearching}
            />

            <EventBoard
              events={listItems}
              isLoading={browseQuery.isPending && browseQuery.fetchStatus !== 'idle'}
              isError={browseQuery.isError}
              error={browseQuery.error}
              onRetry={() => browseQuery.refetch()}
              emptyTitle={isSearching ? 'No matches' : 'No events yet'}
              emptyHint={
                isSearching
                  ? 'Try a different word, or browse the full board.'
                  : 'Be the first to put an event on the calendar.'
              }
              emptyActionLabel={isSearching ? undefined : 'Create event'}
              onEmptyAction={isSearching ? undefined : () => navigate('/events/new')}
              hasNextPage={browseQuery.hasNextPage}
              isFetchingNextPage={browseQuery.isFetchingNextPage}
              onLoadMore={() => browseQuery.fetchNextPage()}
            />
          </>
        )}

        {activeTab === 'map' && (
          <Suspense
            fallback={
              <div className="flex h-[65vh] items-center justify-center rounded-2xl border border-gray-200 dark:border-[#2D1F4D]">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            }
          >
            <EventsMapView />
          </Suspense>
        )}

        {activeTab === 'mine' && (
          <EventBoard
            events={flatten(myEvents.data)}
            isLoading={myEvents.isPending && myEvents.fetchStatus !== 'idle'}
            isError={myEvents.isError}
            error={myEvents.error}
            onRetry={() => myEvents.refetch()}
            emptyTitle="You haven't created any events"
            emptyHint="Events you organize appear here, including drafts, past and cancelled ones."
            emptyActionLabel="Create event"
            onEmptyAction={() => navigate('/events/new')}
            hasNextPage={myEvents.hasNextPage}
            isFetchingNextPage={myEvents.isFetchingNextPage}
            onLoadMore={() => myEvents.fetchNextPage()}
          />
        )}

        {activeTab === 'tickets' && <MyTicketsList />}
      </div>
    </DashboardLayout>
  )
}
