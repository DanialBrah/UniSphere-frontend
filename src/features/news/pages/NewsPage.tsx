import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bookmark, Heart, LayoutGrid, PenSquare, Star } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useAuth } from '../../../hooks/useAuth'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { NewsFilterBar } from '../components/NewsFilterBar'
import { NewsList } from '../components/NewsList'
import {
  useLikedNews,
  useNewsFeed,
  useNewsSearch,
  useSavedNews,
  isSearchableNewsQuery,
} from '../hooks/useNewsQueries'
import { canAuthorNews } from '../utils/permissions'
import type { NewsArticleLike, NewsCategory, NewsFeedFilters, SpringPage } from '../types'
import { CATEGORY_ORDER } from '../utils/display'

type Tab = 'latest' | 'featured' | 'saved' | 'liked'

const TABS: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'latest', label: 'Latest', icon: LayoutGrid },
  { id: 'featured', label: 'Featured', icon: Star },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'liked', label: 'Liked', icon: Heart },
]

const flatten = (data?: InfiniteData<SpringPage<NewsArticleLike>>): NewsArticleLike[] =>
  data?.pages.flatMap((p) => p.content) ?? []

function isCategory(value: string | null): value is NewsCategory {
  return value != null && (CATEGORY_ORDER as readonly string[]).includes(value)
}

export default function NewsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('latest')
  const [search, setSearch] = useState('')

  // Tag chips on cards and the article header link back here with ?tag=, so the URL seeds the
  // initial filter rather than the page always starting unfiltered.
  const [filters, setFilters] = useState<NewsFeedFilters>(() => ({
    category: isCategory(searchParams.get('category')) ? searchParams.get('category') as NewsCategory : null,
    tag: searchParams.get('tag'),
    featured: null,
  }))

  const debouncedSearch = useDebouncedValue(search)
  const isSearching = isSearchableNewsQuery(debouncedSearch)

  // The controller delegates /news/featured to the same handler as /news?featured=true, so
  // reusing this hook keeps one cache space instead of fragmenting it across two endpoints.
  const activeFilters = useMemo<NewsFeedFilters>(
    () => (tab === 'featured' ? { ...filters, featured: true } : filters),
    [filters, tab],
  )

  const showFeed = !isSearching && (tab === 'latest' || tab === 'featured')

  const feed = useNewsFeed(activeFilters, showFeed)
  const results = useNewsSearch(debouncedSearch)
  const saved = useSavedNews(!isSearching && tab === 'saved')
  const liked = useLikedNews(!isSearching && tab === 'liked')

  const canWrite = canAuthorNews(user)

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Campus News</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Announcements and stories from universities, clubs and employers.
            </p>
          </div>

          {/* Authoring entry points live here rather than in the sidebar: the nav has no role
              concept, and students and alumni must never see these. */}
          {canWrite && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/news/studio"
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors"
              >
                Studio
              </Link>
              <Link
                to="/news/editor"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                <PenSquare size={15} />
                Write
              </Link>
            </div>
          )}
        </div>

        <NewsFilterBar
          filters={filters}
          onChange={setFilters}
          search={search}
          onSearchChange={setSearch}
        />

        {/* Searching replaces the tabs entirely — mixing results into a tab the user didn't
            pick reads as a bug. Clearing the box restores whatever tab was active. */}
        {isSearching ? (
          <>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
              Results for &ldquo;{debouncedSearch.trim()}&rdquo;
            </h2>
            <NewsList
              articles={flatten(results.data)}
              isLoading={results.isLoading}
              isError={results.isError}
              error={results.error}
              onRetry={() => results.refetch()}
              emptyTitle="No articles found"
              emptyHint="Try a different word. Search only covers published articles."
              hasNextPage={results.hasNextPage}
              isFetchingNextPage={results.isFetchingNextPage}
              onLoadMore={() => results.fetchNextPage()}
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

            {showFeed && (
              <NewsList
                articles={flatten(feed.data)}
                isLoading={feed.isLoading}
                isError={feed.isError}
                error={feed.error}
                onRetry={() => feed.refetch()}
                emptyTitle={tab === 'featured' ? 'No featured articles' : 'No articles yet'}
                emptyHint={
                  tab === 'featured'
                    ? 'Featured articles are picked by admins. Check back soon.'
                    : 'Once universities and clubs start publishing, their news lands here.'
                }
                hasNextPage={feed.hasNextPage}
                isFetchingNextPage={feed.isFetchingNextPage}
                onLoadMore={() => feed.fetchNextPage()}
              />
            )}

            {tab === 'saved' && (
              <NewsList
                articles={flatten(saved.data)}
                isLoading={saved.isLoading}
                isError={saved.isError}
                error={saved.error}
                onRetry={() => saved.refetch()}
                emptyTitle="Nothing saved yet"
                emptyHint="Bookmark an article and it'll wait for you here."
                hasNextPage={saved.hasNextPage}
                isFetchingNextPage={saved.isFetchingNextPage}
                onLoadMore={() => saved.fetchNextPage()}
                // Saved and Liked exclude drafts but still include archived articles, so the
                // status chip is meaningful on these two tabs.
                showStatus
              />
            )}

            {tab === 'liked' && (
              <NewsList
                articles={flatten(liked.data)}
                isLoading={liked.isLoading}
                isError={liked.isError}
                error={liked.error}
                onRetry={() => liked.refetch()}
                emptyTitle="No liked articles"
                emptyHint="Articles you like show up here."
                hasNextPage={liked.hasNextPage}
                isFetchingNextPage={liked.isFetchingNextPage}
                onLoadMore={() => liked.fetchNextPage()}
                showStatus
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
