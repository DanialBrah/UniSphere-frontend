import { ExternalLink, Globe, MapPin } from 'lucide-react'
import { StaticLocationMap } from '../../../components/map/StaticLocationMap'
import { createEventIcon, eventCategoryColor } from '../../../components/map/mapIcons'
import { toLatLng } from '../utils/geo'
import type { EventResponse } from '../types'

const CARD = 'rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]'

/** The venue pin, or the online join link — the two are mutually exclusive on every event. */
export function EventLocationPanel({ event }: Readonly<{ event: EventResponse }>) {
  if (event.online) {
    return (
      <section className={CARD}>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
          <Globe className="h-4 w-4 text-primary" />
          Online event
        </h2>
        {event.onlineUrl ? (
          <a
            href={event.onlineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Join link
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No join link was provided.</p>
        )}
      </section>
    )
  }

  const position = toLatLng(event.latitude, event.longitude)
  const accent = eventCategoryColor(event.category)

  return (
    <section className={CARD}>
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        <MapPin className="h-4 w-4 text-primary" />
        Venue
      </h2>

      {event.venueName && (
        <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">{event.venueName}</p>
      )}

      {position ? (
        <StaticLocationMap
          position={position}
          icon={createEventIcon(event.category)}
          accentColor={accent}
          zoom={17}
        />
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No map pin was added to this event.</p>
      )}
    </section>
  )
}
