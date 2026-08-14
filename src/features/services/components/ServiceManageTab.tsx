import { ServiceStatusActions } from './ServiceStatusActions'
import { ServiceStatsPanel } from './ServiceStatsPanel'
import { ServiceOrderRoster } from './ServiceOrderRoster'
import type { ServiceListingResponse } from '../types'

/**
 * Owner/ADMIN console: status controls, stats, then the order roster. A single stacked section
 * rather than sub-tabbed, same as `JobManageTab` — the content volume here doesn't justify a second
 * tab layer.
 */
export function ServiceManageTab({ listing }: Readonly<{ listing: ServiceListingResponse }>) {
  return (
    <div className="space-y-5">
      <ServiceStatusActions listing={listing} />
      <ServiceStatsPanel listingId={listing.id} />
      <ServiceOrderRoster listingId={listing.id} />
    </div>
  )
}
