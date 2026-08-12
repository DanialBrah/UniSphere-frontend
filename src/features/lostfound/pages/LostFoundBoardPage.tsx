import { lazy, Suspense, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Plus } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { LostFoundBoard } from '../components/LostFoundBoard'
import { LostFoundFilterBar } from '../components/LostFoundFilterBar'
import { LostFoundStatsBar } from '../components/LostFoundStatsBar'
import { MyClaimsList } from '../components/MyClaimsList'
import { NearMeToggle } from '../components/NearMeToggle'
import {
  isSearchableLostFoundQuery,
  useLostFoundFeed,
  useLostFoundSearch,
  useMyLostFoundItems,
  useNearbyLostFoundItems,
} from '../hooks/useLostFoundQueries'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { useGeolocation } from '../../../hooks/useGeolocation'
import { EMPTY_LOST_FOUND_FILTERS } from '../types'
import type { LostFoundFilters, LostFoundItemSummaryResponse, SpringPage } from '../types'

/**
 * Leaflet plus react-leaflet is ~150 KB. Lazily loading the map tab keeps it out of the chunk for
 * the majority of visits, which never leave the Browse list.
 */
const LostFoundMapView = lazy(() =>
  import('../components/LostFoundMapView').then((m) => ({ default: m.LostFoundMapView })),
)

const TABS = [
  { id: 'browse', label: 'Browse' },
  { id: 'map', label: 'Map' },
  { id: 'mine', label: 'My reports' },
  { id: 'claims', label: 'My claims' },
] as const

type TabId = (typeof TABS)[number]['id']

function isTabId(value: string | null): value is TabId {
  return TABS.some((tab) => tab.id === value)
}

const flatten = (
  data?: InfiniteData<SpringPage<LostFoundItemSummaryResponse>>,
): LostFoundItemSummaryResponse[] => data?.pages.flatMap((page) => page.content) ?? []

export default function LostFoundBoardPage() {
  const navigate = useNavigate()
  // The tab lives in the URL so a map view is linkable and survives a refresh.
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('view')
  const activeTab: TabId = isTabId(tabParam) ? tabParam : 'browse'

  const [filters, setFilters] = useState<LostFoundFilters>(EMPTY_LOST_FOUND_FILTERS)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const isSearching = isSearchableLostFoundQuery(debouncedSearch)

  // "Near me" mode. Location is requested on click only — see NearMeToggle for why.
  const [nearMe, setNearMe] = useState(false)
  const [radiusKm, setRadiusKm] = useState(5)
  const geo = useGeolocation()

  // Three mutually exclusive sources for the Browse list, in priority order. Typing a query is a
  // more specific intent than a radius, so search wins over "near me".
  const isBrowse = activeTab === 'browse'
  const showNearby = !isSearching && nearMe && geo.position != null
  const showFeed = !isSearching && !showNearby

  const feed = useLostFoundFeed(filters, isBrowse && showFeed)
  const searchResults = useLostFoundSearch(debouncedSearch, filters)
  const nearby = useNearbyLostFoundItems(
    showNearby ? geo.position![0] : null,
    showNearby ? geo.position![1] : null,
    radiusKm,
    filters,
  )
  const myItems = useMyLostFoundItems(null, activeTab === 'mine')

  const nearbyEntries = nearby.data?.pages.flatMap((page) => page.content) ?? []

  const browseQuery = isSearching ? searchResults : feed
  const listQuery = showNearby ? nearby : browseQuery
  const listItems = showNearby
    ? nearbyEntries.map((entry) => entry.item)
    : flatten(browseQuery.data)
  const distances = showNearby
    ? new Map(nearbyEntries.map((entry) => [entry.item.id, entry.distanceKm]))
    : undefined

  const setTab = (tab: TabId) => {
    setSearchParams(tab === 'browse' ? {} : { view: tab }, { replace: true })
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl p-6 lg:p-8">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lost &amp; Found</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Report something you&apos;ve lost or found on campus, and pin it on the map.
            </p>
          </div>

          <button
            onClick={() => navigate('/lost-found/new')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Report an item
          </button>
        </header>

        <LostFoundStatsBar />

        <nav
          aria-label="Lost and found views"
          className="mb-5 flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-[#2D1F4D]"
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
            <LostFoundFilterBar
              filters={filters}
              onChange={setFilters}
              search={search}
              onSearchChange={setSearch}
              // Category isn't a parameter of /items/search, so hide the row rather than render a
              // control that would silently do nothing.
              showCategories={!isSearching}
            />

            {!isSearching && (
              <div className="mb-4">
                <NearMeToggle
                  isActive={nearMe}
                  isLocating={geo.isLoading}
                  error={nearMe ? geo.error : null}
                  radiusKm={radiusKm}
                  onEnable={() => {
                    setNearMe(true)
                    geo.request()
                  }}
                  onDisable={() => {
                    setNearMe(false)
                    geo.reset()
                  }}
                  onRadiusChange={setRadiusKm}
                />
              </div>
            )}

            <LostFoundBoard
              items={listItems}
              distances={distances}
              isLoading={listQuery.isPending && listQuery.fetchStatus !== 'idle'}
              isError={listQuery.isError}
              error={listQuery.error}
              onRetry={() => listQuery.refetch()}
              emptyTitle={emptyTitle()}
              emptyHint={emptyHint()}
              emptyActionLabel={isSearching ? undefined : 'Report an item'}
              onEmptyAction={isSearching ? undefined : () => navigate('/lost-found/new')}
              hasNextPage={listQuery.hasNextPage}
              isFetchingNextPage={listQuery.isFetchingNextPage}
              onLoadMore={() => listQuery.fetchNextPage()}
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
            <LostFoundMapView />
          </Suspense>
        )}

        {activeTab === 'mine' && (
          <LostFoundBoard
            items={flatten(myItems.data)}
            isLoading={myItems.isPending && myItems.fetchStatus !== 'idle'}
            isError={myItems.isError}
            error={myItems.error}
            onRetry={() => myItems.refetch()}
            emptyTitle="You haven't reported anything"
            emptyHint="Reports you file appear here, including ones you've closed or that have expired."
            emptyActionLabel="Report an item"
            onEmptyAction={() => navigate('/lost-found/new')}
            hasNextPage={myItems.hasNextPage}
            isFetchingNextPage={myItems.isFetchingNextPage}
            onLoadMore={() => myItems.fetchNextPage()}
          />
        )}

        {activeTab === 'claims' && <MyClaimsList />}
      </div>
    </DashboardLayout>
  )

  function emptyTitle(): string {
    if (isSearching) return 'No matches'
    if (showNearby) return 'Nothing reported nearby'
    return 'Nothing reported yet'
  }

  function emptyHint(): string {
    if (isSearching) return 'Try a different word, or browse the full board.'
    if (showNearby) {
      return `No items with a map pin within ${radiusKm} km. Widen the radius, or turn off "Near me" to see the whole board.`
    }
    return 'Be the first to report a lost or found item on your campus.'
  }
}
