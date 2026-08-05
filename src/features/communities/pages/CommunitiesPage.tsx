import { useState } from 'react'
import { Compass, Plus, Search, Users2, X } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { CommunityList } from '../components/CommunityList'
import { CreateCommunityModal } from '../components/CreateCommunityModal'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { useCommunities, useCommunitySearch, useMyCommunities } from '../hooks/useCommunities'
import type { CommunityResponse, SpringPage } from '../types'
import type { InfiniteData } from '@tanstack/react-query'

type Tab = 'discover' | 'mine'

const flatten = (data?: InfiniteData<SpringPage<CommunityResponse>>): CommunityResponse[] =>
  data?.pages.flatMap((p) => p.content) ?? []

export default function CommunitiesPage() {
  const [tab, setTab] = useState<Tab>('discover')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const debouncedSearch = useDebouncedValue(search)
  const isSearching = debouncedSearch.trim().length > 0

  const discover = useCommunities()
  const mine = useMyCommunities()
  const searchResults = useCommunitySearch(debouncedSearch)

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Communities</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus size={15} />
            Create community
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Join groups built around shared interests, or start your own.
        </p>

        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D] focus-within:border-primary/50 transition-colors mb-5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities…"
            aria-label="Search communities"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isSearching ? (
          <>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
              Results for &ldquo;{debouncedSearch.trim()}&rdquo;
            </h2>
            <CommunityList
              communities={flatten(searchResults.data)}
              isLoading={searchResults.isLoading}
              isError={searchResults.isError}
              error={searchResults.error}
              onRetry={() => searchResults.refetch()}
              emptyTitle="No communities found"
              emptyHint="Try a different name."
              hasNextPage={searchResults.hasNextPage}
              isFetchingNextPage={searchResults.isFetchingNextPage}
              onLoadMore={() => searchResults.fetchNextPage()}
            />
          </>
        ) : (
          <>
            <div className="flex border-b border-gray-200 dark:border-[#2D1F4D] mb-5">
              <button
                onClick={() => setTab('discover')}
                className={[
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  tab === 'discover'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                ].join(' ')}
              >
                <Compass size={15} />
                Discover
              </button>
              <button
                onClick={() => setTab('mine')}
                className={[
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  tab === 'mine'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                ].join(' ')}
              >
                <Users2 size={15} />
                Mine
              </button>
            </div>

            {tab === 'discover' && (
              <CommunityList
                communities={flatten(discover.data)}
                isLoading={discover.isLoading}
                isError={discover.isError}
                error={discover.error}
                onRetry={() => discover.refetch()}
                emptyTitle="No communities yet"
                emptyHint="Be the first to create one."
                hasNextPage={discover.hasNextPage}
                isFetchingNextPage={discover.isFetchingNextPage}
                onLoadMore={() => discover.fetchNextPage()}
              />
            )}

            {tab === 'mine' && (
              <CommunityList
                communities={flatten(mine.data)}
                isLoading={mine.isLoading}
                isError={mine.isError}
                error={mine.error}
                onRetry={() => mine.refetch()}
                emptyTitle="You haven't joined any communities"
                emptyHint="Browse Discover or search to find one."
                hasNextPage={mine.hasNextPage}
                isFetchingNextPage={mine.isFetchingNextPage}
                onLoadMore={() => mine.fetchNextPage()}
              />
            )}
          </>
        )}
      </div>

      {showCreate && <CreateCommunityModal onClose={() => setShowCreate(false)} />}
    </DashboardLayout>
  )
}
