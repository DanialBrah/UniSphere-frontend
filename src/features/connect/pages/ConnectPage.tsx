import { useState } from 'react'
import { Search, Sparkles, UserRound, Users, X } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { PeopleList } from '../components/PeopleList'
import { useAuth } from '../../../hooks/useAuth'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import {
  useFollowers,
  useFollowing,
  usePeopleSearch,
  useRecommendations,
} from '../hooks/useConnectPeople'
import type { SpringPage } from '../../social/types'
import type { PersonSummary } from '../types'
import type { InfiniteData } from '@tanstack/react-query'

type Tab = 'discover' | 'followers' | 'following'

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'discover',  label: 'Discover',  icon: Sparkles   },
  { id: 'followers', label: 'Followers', icon: Users      },
  { id: 'following', label: 'Following', icon: UserRound  },
]

const flatten = (data?: InfiniteData<SpringPage<PersonSummary>>): PersonSummary[] =>
  data?.pages.flatMap((p) => p.content) ?? []

export default function ConnectPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('discover')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const isSearching = debouncedSearch.trim().length > 0

  const recommendations = useRecommendations()
  const searchResults = usePeopleSearch(debouncedSearch)
  const followers = useFollowers(tab === 'followers' ? (user?.id ?? null) : null)
  const following = useFollowing(tab === 'following' ? (user?.id ?? null) : null)

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Connect</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Find people across campus and build your network.
        </p>

        {/* Search */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D] focus-within:border-primary/50 transition-colors mb-5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people by name or email…"
            aria-label="Search people"
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

        {/* Searching replaces the tabs entirely — mixing a filtered list into a tab the user
            didn't pick reads as a bug. Clearing the box restores whatever tab was active. */}
        {isSearching ? (
          <>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
              Results for &ldquo;{debouncedSearch.trim()}&rdquo;
            </h2>
            <PeopleList
              people={flatten(searchResults.data)}
              isLoading={searchResults.isLoading}
              isError={searchResults.isError}
              error={searchResults.error}
              onRetry={() => searchResults.refetch()}
              emptyTitle="No people found"
              emptyHint="Try a different name or email address."
              hasNextPage={searchResults.hasNextPage}
              isFetchingNextPage={searchResults.isFetchingNextPage}
              onLoadMore={() => searchResults.fetchNextPage()}
            />
          </>
        ) : (
          <>
            <div className="flex border-b border-gray-200 dark:border-[#2D1F4D] mb-5">
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = tab === id
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={[
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                      active
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                    ].join(' ')}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                )
              })}
            </div>

            {tab === 'discover' && (
              <PeopleList
                people={recommendations.data ?? []}
                isLoading={recommendations.isLoading}
                isError={recommendations.isError}
                error={recommendations.error}
                onRetry={() => recommendations.refetch()}
                emptyTitle="No suggestions yet"
                emptyHint="Recommendations come from people your connections follow, and from others at your university. Try searching for someone to get started."
              />
            )}

            {tab === 'followers' && (
              <PeopleList
                people={flatten(followers.data)}
                isLoading={followers.isLoading}
                isError={followers.isError}
                error={followers.error}
                onRetry={() => followers.refetch()}
                emptyTitle="No followers yet"
                emptyHint="When someone follows you, they'll show up here."
                hasNextPage={followers.hasNextPage}
                isFetchingNextPage={followers.isFetchingNextPage}
                onLoadMore={() => followers.fetchNextPage()}
              />
            )}

            {tab === 'following' && (
              <PeopleList
                people={flatten(following.data)}
                isLoading={following.isLoading}
                isError={following.isError}
                error={following.error}
                onRetry={() => following.refetch()}
                emptyTitle="You're not following anyone yet"
                emptyHint="Follow people from Discover or search to see them here."
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
