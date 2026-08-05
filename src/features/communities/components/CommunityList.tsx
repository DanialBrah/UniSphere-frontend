import { Loader2, Users2 } from 'lucide-react'
import { CommunityCard } from './CommunityCard'
import { getErrorMessage } from '../../../lib/utils'
import type { CommunityResponse } from '../types'

interface Props {
  communities: CommunityResponse[]
  isLoading: boolean
  isError: boolean
  error?: unknown
  onRetry?: () => void
  emptyTitle: string
  emptyHint?: string
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#130D22] border border-gray-200 dark:border-[#2D1F4D] overflow-hidden">
      <div className="w-full h-24 bg-gray-200 dark:bg-[#2D1F4D] animate-pulse" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-[#2D1F4D] animate-pulse" />
        <div className="h-2.5 w-full rounded bg-gray-100 dark:bg-[#241a38] animate-pulse" />
        <div className="h-7 w-full rounded-lg bg-gray-200 dark:bg-[#2D1F4D] animate-pulse mt-2" />
      </div>
    </div>
  )
}

/** Shared list body: skeletons, error state, empty state, cards, load-more. */
export function CommunityList({
  communities, isLoading, isError, error, onRetry,
  emptyTitle, emptyHint, hasNextPage, isFetchingNextPage, onLoadMore,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm text-red-500 dark:text-red-400">Couldn't load communities</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{getErrorMessage(error)}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-xs text-primary font-medium hover:underline mt-1">
            Retry
          </button>
        )}
      </div>
    )
  }

  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1E1430] flex items-center justify-center">
          <Users2 size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{emptyTitle}</p>
        {emptyHint && (
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">{emptyHint}</p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {communities.map((c) => <CommunityCard key={c.id} community={c} />)}
      </div>

      {hasNextPage && onLoadMore && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-primary/40 hover:text-primary disabled:opacity-50 transition-colors"
          >
            {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  )
}
