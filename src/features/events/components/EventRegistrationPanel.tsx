import { useState } from 'react'
import { ExternalLink, Info, Loader2, UserCheck, UserPlus } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { EventTicketQr } from './EventTicketQr'
import {
  useMyEventRegistration,
  useRegisterForEvent,
  useCancelEventRegistration,
} from '../hooks/useEventRegistrations'
import { isPastInBrowserTime } from '../utils/dateUtils'
import { useAuth } from '../../../hooks/useAuth'
import type { EventRegistrationResponse, EventResponse } from '../types'

const PANEL = 'rounded-2xl border p-4'
const NEUTRAL_PANEL = `${PANEL} border-gray-200 bg-gray-50 dark:border-[#2D1F4D] dark:bg-white/5`

function NoticePanel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={NEUTRAL_PANEL}>
      <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>
    </div>
  )
}

/** The organizer/admin removed a previous registration of the viewer's — not a self-cancel. */
function RemovedByOrganizerNotice({ reason }: Readonly<{ reason: string | null }>) {
  return (
    <div className="mb-3 flex gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
      <Info className="h-4 w-4 shrink-0 translate-y-px text-amber-600 dark:text-amber-400" />
      <p className="text-xs text-amber-800 dark:text-amber-300">
        The organizer removed your previous registration{reason ? `: "${reason}"` : '.'} You can
        register again below.
      </p>
    </div>
  )
}

interface ActiveRegistrationPanelProps {
  eventId: number
  waitlisted: boolean
  registration: EventRegistrationResponse | undefined
}

/** `viewerRegistrationStatus` is REGISTERED or WAITLISTED — an active seat or queue spot. */
function ActiveRegistrationPanel({ eventId, waitlisted, registration }: Readonly<ActiveRegistrationPanelProps>) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const cancelMutation = useCancelEventRegistration(eventId)

  function handleCancel() {
    if (!registration) return
    cancelMutation.mutate(
      { registrationId: registration.id },
      { onSuccess: () => setShowCancelConfirm(false) },
    )
  }

  return (
    <div
      className={`${PANEL} ${waitlisted ? 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'}`}
    >
      <p
        className={`flex items-center gap-1.5 text-sm font-semibold ${waitlisted ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}
      >
        <UserCheck className="h-4 w-4" />
        {waitlisted ? "You're on the waitlist" : "You're registered!"}
      </p>
      {waitlisted && (
        <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/70">
          We'll notify you the moment a seat opens up.
        </p>
      )}

      {!waitlisted && registration && (
        <div className="mt-3">
          <EventTicketQr ticketCode={registration.ticketCode} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowCancelConfirm(true)}
        className="mt-3 text-xs font-medium text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
      >
        Cancel my registration
      </button>

      {showCancelConfirm && (
        <ConfirmModal
          title="Cancel your registration?"
          body={
            waitlisted
              ? "You'll be removed from the waitlist."
              : 'Your seat may go to someone on the waitlist.'
          }
          confirmLabel="Cancel registration"
          destructive
          isPending={cancelMutation.isPending}
          onConfirm={handleCancel}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}
    </div>
  )
}

/** `registrationMode` is EXTERNAL — always an outbound link, never a tracked in-app seat. */
function ExternalRegistrationPanel({ url }: Readonly<{ url: string | null }>) {
  return (
    <div className={`${PANEL} border-gray-200 dark:border-[#2D1F4D]`}>
      <a
        href={url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
      >
        Register on organizer's site
        <ExternalLink className="h-4 w-4" />
      </a>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
        Registration and capacity are managed outside UniSphere for this event.
      </p>
    </div>
  )
}

interface OpenRegistrationPanelProps {
  eventId: number
  full: boolean
  removedByOrganizer: boolean
  cancellationReason: string | null
}

/** INTERNAL, PUBLISHED, not yet started, no active registration — the actual "Register" CTA. */
function OpenRegistrationPanel({
  eventId,
  full,
  removedByOrganizer,
  cancellationReason,
}: Readonly<OpenRegistrationPanelProps>) {
  const registerMutation = useRegisterForEvent(eventId)

  return (
    <div className={`${PANEL} border-gray-200 dark:border-[#2D1F4D]`}>
      {removedByOrganizer && <RemovedByOrganizerNotice reason={cancellationReason} />}
      <button
        type="button"
        onClick={() => registerMutation.mutate()}
        disabled={registerMutation.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {registerMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {full ? 'Join waitlist' : 'Register'}
      </button>
    </div>
  )
}

/**
 * The detail page's registration CTA — a small state machine over `event.status`,
 * `event.viewerRegistrationStatus` and `event.registrationMode`, dispatching to one panel per state.
 *
 * Cancelling an event does NOT retroactively cancel its registrations server-side (confirmed
 * against `EventService.changeStatus` — it only fans out `EVENT_CANCELLED` notifications), so a
 * CANCELLED event with a still-REGISTERED viewer is a real, valid combination, not a bug.
 */
export function EventRegistrationPanel({ event }: Readonly<{ event: EventResponse }>) {
  const { user } = useAuth()
  const isOrganizer = user?.id === event.organizer.id

  const hasActiveRegistration =
    event.viewerRegistrationStatus === 'REGISTERED' || event.viewerRegistrationStatus === 'WAITLISTED'

  const { data: registration } = useMyEventRegistration(event.id, event.viewerRegistrationStatus != null)

  // Someone other than the registrant cancelled it — an organizer/admin removal, not a self-cancel.
  const removedByOrganizer =
    event.viewerRegistrationStatus === 'CANCELLED' &&
    registration?.cancelledBy != null &&
    registration.cancelledBy !== user?.id

  if (event.status === 'DRAFT') {
    return <NoticePanel>This event is still a draft. Publish it from the Manage tab to open registration.</NoticePanel>
  }

  if (event.status === 'CANCELLED') {
    return (
      <div className={`${PANEL} border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10`}>
        <p className="text-sm font-medium text-red-700 dark:text-red-300">This event was cancelled.</p>
        {hasActiveRegistration && (
          <p className="mt-1 text-xs text-red-600/80 dark:text-red-300/70">
            You were {event.viewerRegistrationStatus === 'WAITLISTED' ? 'on the waitlist' : 'registered'} before
            it was cancelled.
          </p>
        )}
      </div>
    )
  }

  if (event.status === 'COMPLETED') {
    return (
      <NoticePanel>
        {event.viewerRegistrationStatus === 'ATTENDED' ? 'You attended this event.' : 'This event has ended.'}
      </NoticePanel>
    )
  }

  if (hasActiveRegistration) {
    return (
      <ActiveRegistrationPanel
        eventId={event.id}
        waitlisted={event.viewerRegistrationStatus === 'WAITLISTED'}
        registration={registration}
      />
    )
  }

  if (event.registrationMode === 'EXTERNAL') {
    return <ExternalRegistrationPanel url={event.externalRegistrationUrl} />
  }

  // Organizers don't occupy a seat at their own event — the register endpoint rejects it outright.
  if (isOrganizer) {
    return (
      <NoticePanel>
        You're the organizer of this event, so there's nothing to register for here — see the
        Manage tab for the attendee roster.
      </NoticePanel>
    )
  }

  if (event.status !== 'PUBLISHED' || isPastInBrowserTime(event.startDatetime)) {
    return <NoticePanel>Registration is closed — this event has already started.</NoticePanel>
  }

  return (
    <OpenRegistrationPanel
      eventId={event.id}
      full={event.availableSeats === 0}
      removedByOrganizer={!!removedByOrganizer}
      cancellationReason={registration?.cancellationReason ?? null}
    />
  )
}
