import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { EventDetailHeader } from '../components/EventDetailHeader'
import { EventLocationPanel } from '../components/EventLocationPanel'
import { EventRegistrationPanel } from '../components/EventRegistrationPanel'
import { EventDetailTabs, type EventDetailTab } from '../components/EventDetailTabs'
import { EventManageTab } from '../components/EventManageTab'
import { EventErrorState } from '../components/EventStateBlocks'
import { EventDetailSkeleton } from '../components/EventSkeleton'
import { useEvent } from '../hooks/useEventQueries'
import { useEventSeatsSubscription } from '../hooks/useEventSeatsSubscription'

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<EventDetailTab>('details')

  const numericId = Number(eventId ?? 0)
  const { data: event, isPending, isError, error, refetch } = useEvent(numericId)

  // Live seat-count updates over STOMP — mounted only here, never from a list/card view.
  useEventSeatsSubscription(event ? numericId : null)

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

        {isPending && <EventDetailSkeleton />}

        {isError && (
          <EventErrorState
            icon={TriangleAlert}
            title="Couldn't load this event"
            error={error}
            onRetry={() => refetch()}
          />
        )}

        {event && (
          <div className="space-y-5">
            <EventDetailHeader event={event} />

            <EventDetailTabs active={tab} onChange={setTab} showManage={event.canModify} />

            {tab === 'details' && (
              <div className="space-y-5">
                <EventRegistrationPanel event={event} />
                <EventLocationPanel event={event} />
              </div>
            )}

            {tab === 'manage' && event.canModify && <EventManageTab event={event} />}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
