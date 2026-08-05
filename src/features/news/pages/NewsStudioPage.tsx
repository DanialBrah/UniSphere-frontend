import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Archive, CalendarClock, FileText, LayoutGrid, PenSquare, Send } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useAuth } from '../../../hooks/useAuth'
import { NewsList } from '../components/NewsList'
import { useMyNews } from '../hooks/useNewsQueries'
import { canAuthorNews } from '../utils/permissions'
import { formatNewsDateTime } from '../utils/dateUtils'
import type { NewsArticleLike, NewsStatus, SpringPage } from '../types'

type Tab = 'all' | 'drafts' | 'scheduled' | 'published' | 'archived'

const TABS: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'scheduled', label: 'Scheduled', icon: CalendarClock },
  { id: 'published', label: 'Published', icon: Send },
  { id: 'archived', label: 'Archived', icon: Archive },
]

/** Drafts and Scheduled share one request — see the note on the query below. */
const STATUS_FOR_TAB: Record<Tab, NewsStatus | null> = {
  all: null,
  drafts: 'DRAFT',
  scheduled: 'DRAFT',
  published: 'PUBLISHED',
  archived: 'ARCHIVED',
}

type StudioArticle = NewsArticleLike & { scheduledAt?: string | null }

const flatten = (data?: InfiniteData<SpringPage<NewsArticleLike>>): StudioArticle[] =>
  data?.pages.flatMap((p) => p.content) ?? []

export default function NewsStudioPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('all')

  /*
   * There is no SCHEDULED status — a queued article is a DRAFT carrying a scheduledAt — so
   * ?status=DRAFT already returns both kinds and firing a second identical request would be
   * pure waste. The two tabs split the same result client-side.
   *
   * Trade-off worth knowing: past 20 drafts, the Scheduled tab only reflects the pages loaded
   * so far. "Load more" is present and authors rarely hold that many drafts, so this is the
   * right call — but it is a choice, not an accident.
   */
  const query = useMyNews(STATUS_FOR_TAB[tab])
  const all = flatten(query.data)

  const articles =
    tab === 'drafts'
      ? all.filter((a) => !a.scheduledAt)
      : tab === 'scheduled'
        ? all.filter((a) => !!a.scheduledAt)
        : all

  if (!canAuthorNews(user)) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-xl mx-auto w-full text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <PenSquare size={28} className="text-primary" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            The newsroom is for institutional accounts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            University, club, employer and admin accounts publish Campus News. You can read,
            save and comment on every article.
          </p>
          <Link
            to="/news"
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Browse news
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Your articles</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drafts, scheduled posts and everything you&rsquo;ve published.
            </p>
          </div>
          <Link
            to="/news/editor"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors shrink-0"
          >
            <PenSquare size={15} />
            New article
          </Link>
        </div>

        <div className="flex border-b border-gray-200 dark:border-[#2D1F4D] mb-5 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={[
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
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

        <NewsList
          articles={articles}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
          emptyTitle={
            tab === 'scheduled'
              ? 'Nothing scheduled'
              : tab === 'all'
                ? "You haven't written anything yet"
                : `No ${tab} articles`
          }
          emptyHint={
            tab === 'scheduled'
              ? 'Set a publish time on a draft and it will appear here.'
              : tab === 'all'
                ? 'Write your first article — it saves as a draft until you publish it.'
                : undefined
          }
          emptyActionLabel={tab === 'all' ? 'Write an article' : undefined}
          onEmptyAction={tab === 'all' ? () => navigate('/news/editor') : undefined}
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={() => query.fetchNextPage()}
          showStatus
          renderFooter={(article) => {
            const scheduledAt = (article as StudioArticle).scheduledAt
            return (
              <div className="flex items-center justify-between gap-3 pt-3 mt-1 border-t border-gray-100 dark:border-[#2D1F4D]">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {scheduledAt ? `Publishes ${formatNewsDateTime(scheduledAt)}` : ''}
                </span>
                <Link
                  to={`/news/editor/${article.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2D1F4D] text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <PenSquare size={13} />
                  {article.status === 'DRAFT' ? 'Continue editing' : 'Edit'}
                </Link>
              </div>
            )
          }}
        />
      </div>
    </DashboardLayout>
  )
}
