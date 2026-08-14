import { motion } from 'framer-motion'
import { TriangleAlert, Wrench } from 'lucide-react'
import { ServiceCard } from './ServiceCard'
import { ServiceGridSkeleton } from './ServiceSkeleton'
import { ServiceErrorState, ServiceStateBlock } from './ServiceStateBlocks'
import { stagger } from '../../../lib/animations'
import type { ServiceListingSummaryResponse } from '../types'

interface ServiceBoardProps {
  listings: ServiceListingSummaryResponse[]
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
}

/**
 * The single skeleton -> error -> empty -> cards -> load-more sequence, shared by every list
 * surface: Browse, search results and My Listings.
 */
export function ServiceBoard({
  listings,
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
}: Readonly<ServiceBoardProps>) {
  if (isLoading) return <ServiceGridSkeleton />

  if (isError) {
    return (
      <ServiceErrorState icon={TriangleAlert} title="Couldn't load these listings" error={error} onRetry={onRetry} />
    )
  }

  if (listings.length === 0) {
    return (
      <ServiceStateBlock
        icon={Wrench}
        title={emptyTitle}
        hint={emptyHint}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    )
  }

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2">
        {listings.map((listing) => (
          <ServiceCard key={listing.id} listing={listing} />
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
