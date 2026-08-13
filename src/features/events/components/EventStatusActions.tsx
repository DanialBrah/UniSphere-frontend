import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Pencil, Trash2, XCircle } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { useChangeEventStatus, useDeleteEvent } from '../hooks/useEventMutations'
import { allowedEventStatusTargets, hasActiveRegistrations } from '../utils/permissions'
import type { EventResponse, EventUserStatusTarget } from '../types'

const ACTION_BUTTON =
  'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-primary-50'
const DISABLED_BUTTON =
  'inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-400 opacity-60 dark:border-[#2D1F4D] dark:text-gray-500'

/**
 * Copy for each transition the FSM allows. `COMPLETED` never appears — the server writes that
 * itself once `endDatetime` passes, and rejects it here with a 409.
 */
const ACTION_COPY: Record<
  EventUserStatusTarget,
  { label: string; title: string; body: string; icon: typeof CheckCircle2 }
> = {
  PUBLISHED: {
    label: 'Publish',
    title: 'Publish this event?',
    body: 'It becomes visible on the browse feed, search and the map, and registration opens.',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancel event',
    title: 'Cancel this event?',
    body: 'Every active registrant is notified. This cannot be undone.',
    icon: XCircle,
  },
}

/**
 * Organizer/ADMIN controls: the status transitions the server will actually accept, plus edit and
 * delete. Rendered only when `event.canModify` is true — that flag is computed server-side from
 * the same rule the API enforces, so it is the honest gate.
 */
export function EventStatusActions({ event }: Readonly<{ event: EventResponse }>) {
  const navigate = useNavigate()
  const [pendingStatus, setPendingStatus] = useState<EventUserStatusTarget | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const changeStatus = useChangeEventStatus(event.id)
  const deleteEvent = useDeleteEvent()

  const targets = allowedEventStatusTargets(event.status)
  const blockedByRegistrations = hasActiveRegistrations(event)

  return (
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Manage this event</h2>

      <div className="flex flex-wrap gap-2">
        {targets.map((target) => {
          const { label, icon: Icon } = ACTION_COPY[target]
          return (
            <button key={target} onClick={() => setPendingStatus(target)} className={ACTION_BUTTON}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}

        <button onClick={() => navigate(`/events/${event.id}/edit`)} className={ACTION_BUTTON}>
          <Pencil className="h-4 w-4" />
          Edit
        </button>

        <button
          onClick={() => !blockedByRegistrations && setConfirmDelete(true)}
          disabled={blockedByRegistrations}
          title={blockedByRegistrations ? 'Cancel this event first — it has active registrations' : undefined}
          className={blockedByRegistrations ? DISABLED_BUTTON : `${ACTION_BUTTON} hover:!border-red-400 hover:!text-red-500`}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {blockedByRegistrations && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This event still has active registrations — cancel it instead of deleting it.
        </p>
      )}

      {pendingStatus && (
        <ConfirmModal
          title={ACTION_COPY[pendingStatus].title}
          body={ACTION_COPY[pendingStatus].body}
          confirmLabel={ACTION_COPY[pendingStatus].label}
          destructive={pendingStatus === 'CANCELLED'}
          isPending={changeStatus.isPending}
          onCancel={() => setPendingStatus(null)}
          onConfirm={() =>
            changeStatus.mutate({ status: pendingStatus }, { onSettled: () => setPendingStatus(null) })
          }
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete this event?"
          body="It disappears from the board and the map straight away. This cannot be undone."
          confirmLabel="Delete"
          destructive
          isPending={deleteEvent.isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            deleteEvent.mutate(event.id, {
              onSuccess: () => navigate('/events', { replace: true }),
              onError: () => setConfirmDelete(false),
            })
          }
        />
      )}
    </section>
  )
}
