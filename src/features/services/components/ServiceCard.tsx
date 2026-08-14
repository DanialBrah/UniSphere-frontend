import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, User } from 'lucide-react'
import { ServiceDeliveryModeBadge, ServiceListingStatusBadge, ServicePricingTypeBadge } from './ServiceBadges'
import { fadeUp } from '../../../lib/animations'
import { formatServiceRelative } from '../utils/dateUtils'
import { formatServicePrice } from '../utils/display'
import type { ServiceListingSummaryResponse } from '../types'

export function ServiceCard({ listing }: Readonly<{ listing: ServiceListingSummaryResponse }>) {
  const isPaused = listing.status === 'PAUSED'

  return (
    <motion.article
      variants={fadeUp}
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] ${
        isPaused ? 'opacity-70' : ''
      }`}
    >
      <Link to={`/services/${listing.id}`} className="block">
        <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
          {listing.portfolioImageUrl ? (
            <img
              // Presigned URL, ~60 min expiry — refetched on window focus so a stale tab re-mints it.
              src={listing.portfolioImageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 dark:text-white/10">
              <User size={28} />
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{listing.title}</h3>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{listing.provider.displayName}</p>
            </div>
            {isPaused && <ServiceListingStatusBadge status={listing.status} />}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
              {listing.category}
            </span>
            <ServicePricingTypeBadge pricingType={listing.pricingType} />
            <ServiceDeliveryModeBadge deliveryMode={listing.deliveryMode} />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatServicePrice(listing.price, listing.pricingType)}
            </span>
            {listing.ratingCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {listing.ratingAvg.toFixed(1)}
                <span className="text-gray-400 dark:text-gray-500">({listing.ratingCount})</span>
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">Listed {formatServiceRelative(listing.createdAt)}</p>
        </div>
      </Link>
    </motion.article>
  )
}
