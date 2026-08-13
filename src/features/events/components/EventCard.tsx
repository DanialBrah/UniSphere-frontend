import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, ImageOff, MapPin } from 'lucide-react'
import { EventCategoryBadge, EventOnlineBadge, EventStatusBadge } from './EventBadges'
import { EventSeatsIndicator } from './EventSeatsIndicator'
import { fadeUp } from '../../../lib/animations'
import { formatEventRange } from '../utils/dateUtils'
import { formatDistance } from '../utils/geo'
import { REGISTRATION_STATUS_LABEL } from '../utils/display'
import type { EventSummaryResponse } from '../types'

interface EventCardProps {
  event: EventSummaryResponse
  /** Set on the /events/nearby list, which wraps the summary alongside a distance. */
  distanceKm?: number
}

export function EventCard({ event, distanceKm }: Readonly<EventCardProps>) {
  const isClosed = event.status === 'CANCELLED' || event.status === 'COMPLETED'

  return (
    <motion.article
      variants={fadeUp}
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] ${
        isClosed ? 'opacity-70' : ''
      }`}
    >
      <Link to={`/events/${event.id}`} className="block">
        <div className="relative h-36 w-full bg-gray-100 dark:bg-white/5">
          {event.coverImageUrl ? (
            <img
              // Presigned URL, ~60 min expiry — refetched on window focus so a stale tab re-mints it.
              src={event.coverImageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-white/20">
              <ImageOff size={28} />
            </div>
          )}

          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            <EventCategoryBadge category={event.category} />
            {event.status !== 'PUBLISHED' && <EventStatusBadge status={event.status} />}
          </div>
        </div>

        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
            {event.title}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5">
            <EventOnlineBadge online={event.online} />
          </div>

          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{formatEventRange(event.startDatetime, event.endDatetime)}</span>
            </p>
            {!event.online && event.venueName && (
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{event.venueName}</span>
                {distanceKm != null && <span>· {formatDistance(distanceKm)}</span>}
              </p>
            )}
          </div>

          {event.registrationMode === 'INTERNAL' && (
            <EventSeatsIndicator
              registeredCount={event.registeredCount}
              waitlistedCount={event.waitlistedCount}
              maxCapacity={event.maxCapacity}
              compact
            />
          )}

          {event.viewerRegistrationStatus && (
            <p className="text-xs font-medium text-primary">
              You're {REGISTRATION_STATUS_LABEL[event.viewerRegistrationStatus].toLowerCase()}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
