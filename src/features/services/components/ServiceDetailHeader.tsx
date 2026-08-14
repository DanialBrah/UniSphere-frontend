import { Link } from 'react-router-dom'
import { ServiceDeliveryModeBadge, ServiceListingStatusBadge, ServicePricingTypeBadge } from './ServiceBadges'
import { ServiceRatingSummary } from './ServiceRatingSummary'
import { getInitials } from '../../../lib/userDisplay'
import { formatServiceRelative } from '../utils/dateUtils'
import { formatServicePrice } from '../utils/display'
import type { ServiceListingResponse } from '../types'

export function ServiceDetailHeader({ listing }: Readonly<{ listing: ServiceListingResponse }>) {
  return (
    <header className="space-y-4">
      {listing.portfolioImageUrl && (
        <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/5">
          <img src={listing.portfolioImageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
          {listing.category}
        </span>
        <ServicePricingTypeBadge pricingType={listing.pricingType} />
        <ServiceDeliveryModeBadge deliveryMode={listing.deliveryMode} />
        {listing.status !== 'ACTIVE' && <ServiceListingStatusBadge status={listing.status} />}
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{listing.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatServicePrice(listing.price, listing.pricingType)}
          </span>
          <ServiceRatingSummary ratingAvg={listing.ratingAvg} ratingCount={listing.ratingCount} />
        </div>
      </div>

      {listing.description && (
        <div>
          <h2 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-white">About this service</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {listing.description}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
        <Link to={`/profile/${listing.provider.id}`} className="shrink-0">
          {listing.provider.avatarUrl ? (
            <img src={listing.provider.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary dark:bg-primary/20">
              {getInitials(listing.provider.displayName)}
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1 text-xs">
          <Link
            to={`/profile/${listing.provider.id}`}
            className="font-medium text-gray-900 hover:text-primary dark:text-white"
          >
            {listing.provider.displayName}
          </Link>
          <p className="text-gray-500 dark:text-gray-400">Listed {formatServiceRelative(listing.createdAt)}</p>
        </div>
      </div>
    </header>
  )
}
