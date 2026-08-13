import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { PageSpinner } from '../../../components/ui/PageSpinner'
import { EventForm } from '../components/EventForm'
import { EventErrorState, EventStateBlock } from '../components/EventStateBlocks'
import { useEvent } from '../hooks/useEventQueries'
import { useCreateEvent, useUpdateEvent } from '../hooks/useEventMutations'
import { isTerminalEventStatus } from '../utils/permissions'

/**
 * Create and edit in one page.
 *
 * `/events/new` and `/events/:eventId/edit` both land here; the presence of `eventId` is what
 * switches modes. React Router v7 ranks by specificity, so the static `new` segment wins over
 * `:eventId` regardless of declaration order.
 */
export default function EventFormPage() {
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const numericId = Number(eventId ?? 0)
  const isEdit = numericId > 0

  const eventQuery = useEvent(numericId, { enabled: isEdit })
  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent(numericId)

  if (isEdit && eventQuery.isPending) return <PageSpinner />

  if (isEdit && eventQuery.isError) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <EventErrorState
            icon={TriangleAlert}
            title="Couldn't load this event"
            error={eventQuery.error}
            onRetry={() => eventQuery.refetch()}
          />
        </div>
      </DashboardLayout>
    )
  }

  const existing = isEdit ? eventQuery.data : undefined

  // `canModify` is computed server-side from the same rule the API enforces, so it's the honest
  // gate here — mirroring the check locally would only add a second place to get it wrong.
  if (existing && !existing.canModify) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <EventStateBlock
            icon={Lock}
            title="You can't edit this event"
            hint="Only the organizer can change it."
            actionLabel="Back to the event"
            onAction={() => navigate(`/events/${numericId}`)}
          />
        </div>
      </DashboardLayout>
    )
  }

  if (existing && isTerminalEventStatus(existing.status)) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <EventStateBlock
            icon={Lock}
            title="This event is closed"
            hint="Cancelled and completed events are kept as a record and can no longer be edited."
            actionLabel="Back to the event"
            onAction={() => navigate(`/events/${numericId}`)}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <header className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit event' : 'Create an event'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {isEdit
              ? 'Update the details — attendees see the changes immediately.'
              : "Saved as a draft first. Publish it when you're ready for people to see it."}
          </p>
        </header>

        <EventForm
          existing={existing}
          onCreate={(body) => createMutation.mutateAsync(body)}
          onUpdate={(body) => updateMutation.mutateAsync(body)}
          onDone={(event) => navigate(`/events/${event.id}`, { replace: true })}
          onCancel={() => navigate(-1)}
        />
      </div>
    </DashboardLayout>
  )
}
