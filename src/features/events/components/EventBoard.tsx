import { motion } from 'framer-motion'
import { CalendarSearch, TriangleAlert } from 'lucide-react'
import { EventCard } from './EventCard'
import { EventGridSkeleton } from './EventSkeleton'
import { EventErrorState, EventStateBlock } from './EventStateBlocks'
import { stagger } from '../../../lib/animations'
import type { EventSummaryResponse } from '../types'

interface EventBoardProps {
  events: EventSummaryResponse[]
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
  /** Distances keyed by event id, supplied only by the /events/nearby surface. */
  distances?: Map<number, number>
}

/**
 * The single skeleton -> error -> empty -> cards -> load-more sequence, shared by every list
 * surface: Browse, search results, My Events and My Tickets' event context.
 */
export function EventBoard({
  events,
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
}: Readonly<EventBoardProps>) {
  if (isLoading) return <EventGridSkeleton />

  if (isError) {
    return (
      <EventErrorState
        icon={TriangleAlert}
        title="Couldn't load these events"
        error={error}
        onRetry={onRetry}
      />
    )
  }

  if (events.length === 0) {
    return (
      <EventStateBlock
        icon={CalendarSearch}
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
        {events.map((event) => (
          <EventCard key={event.id} event={event} distanceKm={distances?.get(event.id)} />
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
