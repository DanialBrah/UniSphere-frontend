import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { ServiceBoard } from '../components/ServiceBoard'
import { ServiceFilterBar } from '../components/ServiceFilterBar'
import { MyServiceOrdersList } from '../components/MyServiceOrdersList'
import { isSearchableServiceQuery, useMyServiceListings, useServiceFeed, useServiceSearch } from '../hooks/useServiceQueries'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { useAuth } from '../../../hooks/useAuth'
import { canCreateService, canOrderService } from '../utils/permissions'
import { EMPTY_SERVICE_FILTERS } from '../types'
import type { ServiceFilters, ServiceListingSummaryResponse, SpringPage } from '../types'

/**
 * Services splits its user base asymmetrically like Jobs — only STUDENT/ALUMNI/CLUB can provide a
 * listing, only non-ADMIN can order — so the tab list is built conditionally on role rather than a
 * fixed constant.
 */
const BROWSE_TAB = { id: 'browse', label: 'Browse' } as const
const MINE_TAB = { id: 'mine', label: 'My Listings' } as const
const MY_ORDERS_TAB = { id: 'my-orders', label: 'My Orders' } as const
const RECEIVED_TAB = { id: 'received', label: 'Orders Received' } as const

type TabId = typeof BROWSE_TAB.id | typeof MINE_TAB.id | typeof MY_ORDERS_TAB.id | typeof RECEIVED_TAB.id

const flatten = (
  data?: InfiniteData<SpringPage<ServiceListingSummaryResponse>>,
): ServiceListingSummaryResponse[] => data?.pages.flatMap((page) => page.content) ?? []

export default function ServicesBoardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canPost = canCreateService(user)
  const canSeeMyOrders = canOrderService(user)

  const tabs = useMemo(() => {
    const list: Array<{ id: TabId; label: string }> = [BROWSE_TAB]
    if (canPost) list.push(MINE_TAB)
    if (canSeeMyOrders) list.push(MY_ORDERS_TAB)
    if (canPost) list.push(RECEIVED_TAB)
    return list
  }, [canPost, canSeeMyOrders])

  // The tab lives in the URL so a filtered view is linkable and survives a refresh.
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('view')
  const activeTab: TabId = tabs.some((tab) => tab.id === tabParam) ? (tabParam as TabId) : 'browse'

  const [filters, setFilters] = useState<ServiceFilters>(EMPTY_SERVICE_FILTERS)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const isSearching = isSearchableServiceQuery(debouncedSearch)

  const isBrowse = activeTab === 'browse'
  const feed = useServiceFeed(filters, isBrowse && !isSearching)
  const searchResults = useServiceSearch(debouncedSearch, filters.category)
  const myListings = useMyServiceListings(null, activeTab === 'mine')

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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Services</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Browse services offered on campus, or message a provider to request one yourself.
            </p>
          </div>

          {canPost && (
            <button
              onClick={() => navigate('/services/new')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Offer a service
            </button>
          )}
        </header>

        {tabs.length > 1 && (
          <nav
            aria-label="Services views"
            className="mb-5 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200 dark:border-[#2D1F4D]"
          >
            {tabs.map((tab) => (
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
        )}

        {activeTab === 'browse' && (
          <>
            <ServiceFilterBar
              filters={filters}
              onChange={setFilters}
              search={search}
              onSearchChange={setSearch}
              // pricingType/deliveryMode aren't parameters of /services/search, so hide those rows
              // rather than render controls that would silently do nothing.
              showFilterRows={!isSearching}
            />

            <ServiceBoard
              listings={listItems}
              isLoading={browseQuery.isPending && browseQuery.fetchStatus !== 'idle'}
              isError={browseQuery.isError}
              error={browseQuery.error}
              onRetry={() => browseQuery.refetch()}
              emptyTitle={isSearching ? 'No matches' : 'No services yet'}
              emptyHint={
                isSearching
                  ? 'Try a different word, or browse the full board.'
                  : 'Check back soon — new listings appear here.'
              }
              emptyActionLabel={isSearching || !canPost ? undefined : 'Offer a service'}
              onEmptyAction={isSearching || !canPost ? undefined : () => navigate('/services/new')}
              hasNextPage={browseQuery.hasNextPage}
              isFetchingNextPage={browseQuery.isFetchingNextPage}
              onLoadMore={() => browseQuery.fetchNextPage()}
            />
          </>
        )}

        {activeTab === 'mine' && canPost && (
          <ServiceBoard
            listings={flatten(myListings.data)}
            isLoading={myListings.isPending && myListings.fetchStatus !== 'idle'}
            isError={myListings.isError}
            error={myListings.error}
            onRetry={() => myListings.refetch()}
            emptyTitle="You haven't listed any services"
            emptyHint="Listings you create appear here, including paused ones."
            emptyActionLabel="Offer a service"
            onEmptyAction={() => navigate('/services/new')}
            hasNextPage={myListings.hasNextPage}
            isFetchingNextPage={myListings.isFetchingNextPage}
            onLoadMore={() => myListings.fetchNextPage()}
          />
        )}

        {activeTab === 'my-orders' && canSeeMyOrders && <MyServiceOrdersList perspective="client" />}

        {activeTab === 'received' && canPost && <MyServiceOrdersList perspective="provider" />}
      </div>
    </DashboardLayout>
  )
}
