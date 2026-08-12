import { motion } from 'framer-motion'
import { PackageSearch, TriangleAlert } from 'lucide-react'
import { LostFoundCard } from './LostFoundCard'
import { LostFoundGridSkeleton } from './LostFoundSkeleton'
import { LostFoundErrorState, LostFoundStateBlock } from './LostFoundStateBlocks'
import { stagger } from '../../../lib/animations'
import type { LostFoundItemSummaryResponse } from '../types'

interface LostFoundBoardProps {
  items: LostFoundItemSummaryResponse[]
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
  /** Distances keyed by item id, supplied only by the /items/nearby surface. */
  distances?: Map<number, number>
}

/**
 * The single skeleton → error → empty → cards → load-more sequence, shared by every list surface:
 * Browse, search results, My Reports and Nearby.
 *
 * Same prop-bag shape as `NewsList` — one component owning the four states is what stops each tab
 * from inventing its own slightly different empty screen.
 */
export function LostFoundBoard({
  items,
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
  distances,
}: Readonly<LostFoundBoardProps>) {
  if (isLoading) return <LostFoundGridSkeleton />

  if (isError) {
    return (
      <LostFoundErrorState
        icon={TriangleAlert}
        title="Couldn't load these items"
        error={error}
        onRetry={onRetry}
      />
    )
  }

  if (items.length === 0) {
    return (
      <LostFoundStateBlock
        icon={PackageSearch}
        title={emptyTitle}
        hint={emptyHint}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    )
  }

  return (
    <>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2"
      >
        {items.map((item) => (
          <LostFoundCard key={item.id} item={item} distanceKm={distances?.get(item.id)} />
        ))}
      </motion.div>

      {hasNextPage && onLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  )
}
