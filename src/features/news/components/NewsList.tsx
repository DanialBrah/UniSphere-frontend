import { Loader2, Newspaper } from 'lucide-react'
import { motion } from 'framer-motion'
import { stagger } from '../../../lib/animations'
import { NewsCard } from './NewsCard'
import { NewsSkeleton } from './NewsSkeleton'
import { NewsErrorState, NewsStateBlock } from './NewsStateBlocks'
import type { NewsArticleLike } from '../types'

interface Props {
  articles: NewsArticleLike[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  emptyTitle: string
  emptyHint?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  showStatus?: boolean
  renderFooter?: (article: NewsArticleLike) => React.ReactNode
}

/**
 * The one place the skeleton -> error -> empty -> list -> load-more sequence is written.
 *
 * Every reader surface goes through it — the feed, search results, Saved, Liked and all five
 * Studio tabs — so the states stay identical and none of them drifts out of sync.
 */
export function NewsList({
  articles,
  isLoading,
  isError,
  error,
  onRetry,
  emptyTitle,
  emptyHint,
  emptyActionLabel,
  onEmptyAction,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  showStatus,
  renderFooter,
}: Props) {
  if (isLoading && articles.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <NewsSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <NewsErrorState
        icon={Newspaper}
        title="Couldn't load articles"
        error={error}
        onRetry={onRetry}
      />
    )
  }

  if (articles.length === 0) {
    return (
      <NewsStateBlock
        icon={Newspaper}
        title={emptyTitle}
        hint={emptyHint}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    )
  }

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
        {articles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            showStatus={showStatus}
            footer={renderFooter?.(article)}
          />
        ))}
      </motion.div>

      {hasNextPage && onLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
            {isFetchingNextPage ? 'Loading…' : 'Load more articles'}
          </button>
        </div>
      )}
    </>
  )
}
