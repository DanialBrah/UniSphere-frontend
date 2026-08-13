import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { EventRegistrationStatusBadge } from './EventBadges'
import { EventTicketQr } from './EventTicketQr'
import { useCancelEventRegistration } from '../hooks/useEventRegistrations'
import { formatEventDateTime } from '../utils/dateUtils'
import type { EventRegistrationResponse } from '../types'

/** One row in "My tickets" — spans every event the caller has ever registered for. */
export function MyTicketCard({ registration }: Readonly<{ registration: EventRegistrationResponse }>) {
  const [showQr, setShowQr] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const cancelMutation = useCancelEventRegistration(registration.eventId)

  const canCancel = registration.status === 'REGISTERED' || registration.status === 'WAITLISTED'
  // registration.userId is always the caller's own id here ("my tickets" is self-only), so this
  // alone is enough to tell an organizer/admin removal apart from a self-cancel.
  const removedByOrganizer =
    registration.status === 'CANCELLED' &&
    registration.cancelledBy != null &&
    registration.cancelledBy !== registration.userId

  return (
    <article className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`/events/${registration.eventId}`}
            className="block truncate text-sm font-semibold text-gray-900 hover:text-primary dark:text-white"
          >
            {registration.eventTitle ?? 'Untitled event'}
          </Link>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Registered {formatEventDateTime(registration.createdAt)}
          </p>
        </div>
        <EventRegistrationStatusBadge status={registration.status} />
      </div>

      {registration.checkedInAt && (
        <p className="text-xs text-primary">Checked in {formatEventDateTime(registration.checkedInAt)}</p>
      )}

      {removedByOrganizer && (
        <div className="flex gap-2 rounded-xl bg-amber-50 p-2.5 dark:bg-amber-500/10">
          <Info className="h-3.5 w-3.5 shrink-0 translate-y-px text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            The organizer removed this registration
            {registration.cancellationReason ? `: "${registration.cancellationReason}"` : '.'}
          </p>
        </div>
      )}

      {registration.status === 'REGISTERED' && (
        <div>
          <button
            onClick={() => setShowQr((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {showQr ? 'Hide ticket' : 'Show ticket'}
            {showQr ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showQr && (
            <div className="mt-3">
              <EventTicketQr ticketCode={registration.ticketCode} />
            </div>
          )}
        </div>
      )}

      {canCancel && (
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="text-xs font-medium text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
        >
          Cancel registration
        </button>
      )}

      {showCancelConfirm && (
        <ConfirmModal
          title="Cancel your registration?"
          body={
            registration.status === 'WAITLISTED'
              ? "You'll be removed from the waitlist."
              : 'Your seat may go to someone on the waitlist.'
          }
          confirmLabel="Cancel registration"
          destructive
          isPending={cancelMutation.isPending}
          onConfirm={() =>
            cancelMutation.mutate(
              { registrationId: registration.id },
              { onSuccess: () => setShowCancelConfirm(false) },
            )
          }
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}
    </article>
  )
}
