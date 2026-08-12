import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ImageOff, MapPin, Users } from 'lucide-react'
import {
  ApproximateLocationBadge,
  LostFoundCategoryBadge,
  LostFoundStatusBadge,
  LostFoundTypeBadge,
} from './LostFoundBadges'
import { fadeUp } from '../../../lib/animations'
import { formatLostFoundRelative } from '../utils/dateUtils'
import { formatDistance } from '../utils/geo'
import type { LostFoundItemSummaryResponse } from '../types'

interface LostFoundCardProps {
  item: LostFoundItemSummaryResponse
  /** Set on the /items/nearby list, which wraps the summary alongside a distance. */
  distanceKm?: number
}

export function LostFoundCard({ item, distanceKm }: Readonly<LostFoundCardProps>) {
  const isClosed = item.status !== 'OPEN' && item.status !== 'CLAIMED'

  return (
    <motion.article
      variants={fadeUp}
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] ${
        isClosed ? 'opacity-70' : ''
      }`}
    >
      <Link to={`/lost-found/${item.id}`} className="block">
        <div className="relative h-36 w-full bg-gray-100 dark:bg-white/5">
          {item.primaryImageUrl ? (
            <img
              // Presigned URL, ~60 min expiry — never cached beyond the query, and the query
              // refetches on window focus so a stale tab re-mints it.
              src={item.primaryImageUrl}
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
            <LostFoundTypeBadge type={item.itemType} />
            {item.status !== 'OPEN' && <LostFoundStatusBadge status={item.status} />}
          </div>
        </div>

        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
            {item.title}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5">
            <LostFoundCategoryBadge category={item.category} />
            {item.coordinatesApproximate && <ApproximateLocationBadge />}
          </div>

          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            {item.incidentPlace && (
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{item.incidentPlace}</span>
              </p>
            )}
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {formatLostFoundRelative(item.occurredAt)}
              {distanceKm != null && <span>· {formatDistance(distanceKm)}</span>}
            </p>
            {/* Only the reporter ever sees a non-zero count — everyone else gets 0 from the server. */}
            {item.pendingClaimCount > 0 && (
              <p className="flex items-center gap-1.5 text-primary">
                <Users className="h-3.5 w-3.5 shrink-0" />
                {item.pendingClaimCount} pending{' '}
                {item.pendingClaimCount === 1 ? 'claim' : 'claims'}
              </p>
            )}
          </div>

          {item.viewerClaimStatus && (
            <p className="text-xs font-medium text-primary">
              {item.viewerClaimStatus === 'PENDING'
                ? 'Your claim is awaiting a decision'
                : `Your claim was ${item.viewerClaimStatus.toLowerCase()}`}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
