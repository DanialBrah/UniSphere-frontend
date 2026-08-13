import { useState } from 'react'
import { Users, TriangleAlert } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { EventAttendeeRow } from './EventAttendeeRow'
import { RemoveAttendeeModal } from './RemoveAttendeeModal'
import { EventRosterRowSkeleton } from './EventSkeleton'
import { EventErrorState, EventStateBlock } from './EventStateBlocks'
import { useEventRoster, useCancelEventRegistration } from '../hooks/useEventRegistrations'
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

/** Organizer/ADMIN-only attendee roster — status-filterable, with a per-row removal action. */
export function EventAttendeeRoster({ eventId }: Readonly<{ eventId: number }>) {
  const [status, setStatus] = useState<EventRegistrationStatus | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<EventRegistrationResponse | null>(null)
  const query = useEventRoster(eventId, status, true)
  const cancelMutation = useCancelEventRegistration(eventId)

  const registrations = flatten(query.data)

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        <Users className="h-4 w-4 text-primary" />
        Attendees
      </h2>

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

      {pendingRemoval && (
        <RemoveAttendeeModal
          attendeeName={pendingRemoval.attendee.displayName}
          isPending={cancelMutation.isPending}
          onCancel={() => setPendingRemoval(null)}
          onConfirm={(reason) =>
            cancelMutation.mutate(
              { registrationId: pendingRemoval.id, reason },
              { onSuccess: () => setPendingRemoval(null) },
            )
          }
        />
      )}
    </section>
  )

  function renderBody() {
    if (query.isPending && query.fetchStatus !== 'idle') {
      return (
        <div className="space-y-2">
          <EventRosterRowSkeleton />
          <EventRosterRowSkeleton />
        </div>
      )
    }

    if (query.isError) {
      return (
        <EventErrorState
          icon={TriangleAlert}
          title="Couldn't load attendees"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )
    }

    if (registrations.length === 0) {
      return (
        <EventStateBlock
          icon={Users}
          title={status ? `No ${REGISTRATION_STATUS_LABEL[status].toLowerCase()} attendees` : 'No registrations yet'}
        />
      )
    }

    return (
      <>
        <div className="space-y-2">
          {registrations.map((registration) => (
            <EventAttendeeRow
              key={registration.id}
              registration={registration}
              isCancelling={
                cancelMutation.isPending && cancelMutation.variables?.registrationId === registration.id
              }
              onCancel={() => setPendingRemoval(registration)}
            />
          ))}
        </div>

        {query.hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
            >
              {query.isFetchingNextPage ? 'Loading…' : 'Load more attendees'}
            </button>
          </div>
        )}
      </>
    )
  }
}
