import { Link } from 'react-router-dom'
import { EventRegistrationStatusBadge } from './EventBadges'
import { getInitials } from '../../../lib/userDisplay'
import { formatEventDateTime } from '../utils/dateUtils'
import type { EventRegistrationResponse } from '../types'

interface EventAttendeeRowProps {
  registration: EventRegistrationResponse
  onCancel?: () => void
  isCancelling?: boolean
}

export function EventAttendeeRow({ registration, onCancel, isCancelling }: Readonly<EventAttendeeRowProps>) {
  const canRemove = registration.status === 'REGISTERED' || registration.status === 'WAITLISTED'
  const { attendee } = registration

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <Link to={`/profile/${registration.userId}`} className="shrink-0">
        {attendee.avatarUrl ? (
          <img src={attendee.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary dark:bg-primary/20">
            {getInitials(attendee.displayName)}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/profile/${registration.userId}`}
          className="text-sm font-medium text-gray-900 hover:text-primary dark:text-white"
        >
          {attendee.displayName}
        </Link>
        <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400">{registration.ticketCode}</p>
        {registration.checkedInAt && (
          <p className="text-[11px] text-primary">Checked in {formatEventDateTime(registration.checkedInAt)}</p>
        )}
        {registration.status === 'CANCELLED' && registration.cancelledAt && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Cancelled {formatEventDateTime(registration.cancelledAt)}
            {registration.cancelledBy != null && registration.cancelledBy !== registration.userId
              ? ' by the organizer'
              : ''}
            {registration.cancellationReason ? ` — "${registration.cancellationReason}"` : ''}
          </p>
        )}
      </div>

      <EventRegistrationStatusBadge status={registration.status} />

      {canRemove && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isCancelling}
          className="text-xs font-medium text-gray-500 underline-offset-2 hover:underline disabled:opacity-50 dark:text-gray-400"
        >
          Remove
        </button>
      )}
    </div>
  )
}
