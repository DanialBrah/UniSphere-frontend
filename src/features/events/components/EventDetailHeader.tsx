import { ImageOff } from 'lucide-react'
import { EventCategoryBadge, EventOnlineBadge, EventStatusBadge } from './EventBadges'
import { EventSeatsIndicator } from './EventSeatsIndicator'
import { getInitials } from '../../../lib/userDisplay'
import { formatEventRange, formatEventRelative } from '../utils/dateUtils'
import type { EventResponse } from '../types'

export function EventDetailHeader({ event }: Readonly<{ event: EventResponse }>) {
  return (
    <header className="space-y-4">
      {event.coverImageUrl ? (
        <img
          // Presigned URL, ~60 min expiry. The detail query refetches on window focus so a tab
          // left open re-mints it rather than rendering a broken image.
          src={event.coverImageUrl}
          alt={event.title}
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-300 dark:bg-white/5 dark:text-white/20">
          <ImageOff size={32} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <EventCategoryBadge category={event.category} />
        <EventStatusBadge status={event.status} />
        <EventOnlineBadge online={event.online} />
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</h1>
        <p
          className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          title={formatEventRange(event.startDatetime, event.endDatetime)}
        >
          {formatEventRange(event.startDatetime, event.endDatetime)}
        </p>
      </div>

      {event.registrationMode === 'INTERNAL' && (
        <EventSeatsIndicator
          registeredCount={event.registeredCount}
          waitlistedCount={event.waitlistedCount}
          maxCapacity={event.maxCapacity}
        />
      )}

      {event.description && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {event.description}
        </p>
      )}

      <div className="flex items-center gap-2.5 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
        {event.organizer.avatarUrl ? (
          <img src={event.organizer.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-[11px] font-semibold text-primary dark:bg-primary/20">
            {getInitials(event.organizer.displayName)}
          </div>
        )}
        <div className="text-xs">
          <p className="font-medium text-gray-900 dark:text-white">{event.organizer.displayName}</p>
          <p className="text-gray-500 dark:text-gray-400">Organizing · created {formatEventRelative(event.createdAt)}</p>
        </div>
      </div>
    </header>
  )
}
