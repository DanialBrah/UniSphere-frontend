import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, TriangleAlert } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { MyTicketCard } from './MyTicketCard'
import { EventRosterRowSkeleton } from './EventSkeleton'
import { EventErrorState, EventStateBlock } from './EventStateBlocks'
import { useMyEventTickets } from '../hooks/useEventRegistrations'
import { REGISTRATION_STATUS_LABEL } from '../utils/display'
import type { EventRegistrationResponse, EventRegistrationStatus, SpringPage } from '../types'

const STATUS_ORDER: EventRegistrationStatus[] = ['REGISTERED', 'WAITLISTED', 'ATTENDED', 'CANCELLED']

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

const flatten = (
  data?: InfiniteData<SpringPage<EventRegistrationResponse>>,
): EventRegistrationResponse[] => data?.pages.flatMap((page) => page.content) ?? []

/** The "My tickets" tab — every registration the caller holds, across every event. */
export function MyTicketsList() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<EventRegistrationStatus | null>(null)
  const query = useMyEventTickets(status)

  const tickets = flatten(query.data)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatus(null)}
          className={`${CHIP_BASE} ${status === null ? CHIP_ACTIVE : CHIP_IDLE}`}
        >
          All
        </button>
        {STATUS_ORDER.map((value) => {
          const active = status === value
          return (
            <button
              key={value}
              onClick={() => setStatus(active ? null : value)}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {REGISTRATION_STATUS_LABEL[value]}
            </button>
          )
        })}
      </div>

      {renderBody()}
    </div>
  )

  function renderBody() {
    if (query.isPending && query.fetchStatus !== 'idle') {
      return (
        <div className="space-y-3">
          <EventRosterRowSkeleton />
          <EventRosterRowSkeleton />
        </div>
      )
    }

    if (query.isError) {
      return (
        <EventErrorState
          icon={TriangleAlert}
          title="Couldn't load your tickets"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )
    }

    if (tickets.length === 0) {
      return (
        <EventStateBlock
          icon={Ticket}
          title={status ? `No ${REGISTRATION_STATUS_LABEL[status].toLowerCase()} tickets` : 'No tickets yet'}
          hint="When you register for an event, it shows up here with your ticket."
          actionLabel="Browse events"
          onAction={() => navigate('/events')}
        />
      )
    }

    return (
      <>
        <div className="space-y-3">
          {tickets.map((registration) => (
            <MyTicketCard key={registration.id} registration={registration} />
          ))}
        </div>

        {query.hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
            >
              {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </>
    )
  }
}
