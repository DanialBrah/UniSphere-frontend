import { EventStatusActions } from './EventStatusActions'
import { EventStatsPanel } from './EventStatsPanel'
import { EventCheckInPanel } from './EventCheckInPanel'
import { EventAttendeeRoster } from './EventAttendeeRoster'
import type { EventResponse } from '../types'

/**
 * Organizer/ADMIN console: status controls, then — for INTERNAL events only — stats, check-in and
 * the attendee roster. A single stacked section rather than sub-tabbed: the content volume here
 * doesn't justify a second tab layer the way Communities' Manage tab (requests/bans/settings) does.
 */
export function EventManageTab({ event }: Readonly<{ event: EventResponse }>) {
  return (
    <div className="space-y-5">
      <EventStatusActions event={event} />

      {event.registrationMode === 'INTERNAL' ? (
        <>
          <EventStatsPanel eventId={event.id} />
          <EventCheckInPanel eventId={event.id} />
          <EventAttendeeRoster eventId={event.id} />
        </>
      ) : (
        <p className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 dark:border-[#2D1F4D] dark:bg-white/5 dark:text-gray-400">
          This event uses external registration, so attendance and check-in aren&apos;t tracked in
          UniSphere.
        </p>
      )}
    </div>
  )
}
