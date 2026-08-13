import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import { CATEGORY_LABEL } from '../utils/display'
import { formatEventDateTime } from '../utils/dateUtils'
import type { EventMapPinResponse } from '../types'

/**
 * Popup content for a map pin.
 *
 * Leaflet renders popups into its own DOM subtree outside the React root's normal flow, so this
 * carries explicit colours rather than relying on any inherited typography. `<Link>` still works —
 * react-leaflet portals the children, keeping them inside the router's context.
 */
export function EventsMapPopup({ pin }: Readonly<{ pin: EventMapPinResponse }>) {
  return (
    <div className="w-52 space-y-2">
      {pin.coverImageUrl && (
        <img
          src={pin.coverImageUrl}
          alt=""
          className="h-24 w-full rounded-lg object-cover"
          loading="lazy"
        />
      )}

      <p className="!my-0 text-xs text-gray-500">{CATEGORY_LABEL[pin.category]}</p>
      <p className="!my-0 text-sm font-semibold leading-snug text-gray-900">{pin.title}</p>
      <p className="!my-0 text-xs text-gray-500">{formatEventDateTime(pin.startDatetime)}</p>

      {pin.maxCapacity != null && (
        <p className="!my-0 flex items-center gap-1.5 text-xs text-gray-500">
          <Users className="h-3.5 w-3.5" />
          {pin.registeredCount} / {pin.maxCapacity} going
        </p>
      )}

      <Link
        to={`/events/${pin.id}`}
        className="!mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        View details
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
