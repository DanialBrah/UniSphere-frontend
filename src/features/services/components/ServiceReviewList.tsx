import type { InfiniteData } from '@tanstack/react-query'
import { MessageSquareText, Star, TriangleAlert } from 'lucide-react'
import { useServiceListingReviews } from '../hooks/useServiceReviews'
import { ServiceErrorState, ServiceStateBlock } from './ServiceStateBlocks'
import { formatServiceRelative } from '../utils/dateUtils'
import { getInitials } from '../../../lib/userDisplay'
import type { ServiceReviewResponse, SpringPage } from '../types'

const flatten = (data?: InfiniteData<SpringPage<ServiceReviewResponse>>): ServiceReviewResponse[] =>
  data?.pages.flatMap((page) => page.content) ?? []

function ReviewStars({ rating }: Readonly<{ rating: number }>) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-white/15'} />
      ))}
    </div>
  )
}

export function ServiceReviewList({ listingId }: Readonly<{ listingId: number }>) {
  const query = useServiceListingReviews(listingId)
  const reviews = flatten(query.data)

  if (query.isPending && query.fetchStatus !== 'idle') {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading reviews…</p>
  }

  if (query.isError) {
    return (
      <ServiceErrorState icon={TriangleAlert} title="Couldn't load reviews" error={query.error} onRetry={() => query.refetch()} />
    )
  }

  if (reviews.length === 0) {
    return <ServiceStateBlock icon={MessageSquareText} title="No reviews yet" hint="Reviews appear here once orders are completed and rated." />
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <article key={review.id} className="rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
          <div className="flex items-center gap-2.5">
            {review.reviewer.avatarUrl ? (
              <img src={review.reviewer.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary dark:bg-primary/20">
                {getInitials(review.reviewer.displayName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{review.reviewer.displayName}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{formatServiceRelative(review.createdAt)}</p>
            </div>
            <ReviewStars rating={review.rating} />
          </div>
          {review.comment && (
            <p className="mt-2.5 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
          )}
        </article>
      ))}

      {query.hasNextPage && (
        <div className="text-center">
          <button
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
          >
            {query.isFetchingNextPage ? 'Loading…' : 'Load more reviews'}
          </button>
        </div>
      )}
    </div>
  )
}
