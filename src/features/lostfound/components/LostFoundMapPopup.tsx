import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {
  ApproximateLocationBadge,
  LostFoundStatusBadge,
  LostFoundTypeBadge,
} from './LostFoundBadges'
import { CATEGORY_LABEL } from '../utils/display'
import type { LostFoundMapPinResponse } from '../types'

/**
 * Popup content for a map pin.
 *
 * Leaflet renders popups into its own DOM subtree outside the React root's normal flow, so this
 * carries explicit colours rather than relying on any inherited typography. `<Link>` still works —
 * react-leaflet portals the children, keeping them inside the router's context.
 */
export function LostFoundMapPopup({ pin }: Readonly<{ pin: LostFoundMapPinResponse }>) {
  return (
    <div className="w-52 space-y-2">
      {pin.thumbnailUrl && (
        <img
          src={pin.thumbnailUrl}
          alt=""
          className="h-24 w-full rounded-lg object-cover"
          loading="lazy"
        />
      )}

      <div className="flex flex-wrap gap-1.5">
        <LostFoundTypeBadge type={pin.itemType} />
        {pin.status !== 'OPEN' && <LostFoundStatusBadge status={pin.status} />}
      </div>

      <p className="!my-0 text-sm font-semibold leading-snug text-gray-900">{pin.title}</p>
      <p className="!my-0 text-xs text-gray-500">{CATEGORY_LABEL[pin.category]}</p>

      {pin.coordinatesApproximate && (
        <div className="space-y-1">
          <ApproximateLocationBadge />
          <p className="!my-0 text-[11px] leading-snug text-gray-500">
            The exact spot is shown to the owner once a claim is approved.
          </p>
        </div>
      )}

      <Link
        to={`/lost-found/${pin.id}`}
        className="!mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        View details
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
