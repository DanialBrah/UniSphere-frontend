import {
  DELIVERY_MODE_CHIP,
  DELIVERY_MODE_LABEL,
  LISTING_STATUS_CHIP,
  LISTING_STATUS_LABEL,
  ORDER_STATUS_CHIP,
  ORDER_STATUS_LABEL,
  PRICING_TYPE_CHIP,
  PRICING_TYPE_LABEL,
} from '../utils/display'
import type { ServiceDeliveryMode, ServiceListingStatus, ServiceOrderStatus, ServicePricingType } from '../types'

const CHIP = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold'

export function ServicePricingTypeBadge({ pricingType }: Readonly<{ pricingType: ServicePricingType }>) {
  return <span className={`${CHIP} ${PRICING_TYPE_CHIP[pricingType]}`}>{PRICING_TYPE_LABEL[pricingType]}</span>
}

export function ServiceDeliveryModeBadge({ deliveryMode }: Readonly<{ deliveryMode: ServiceDeliveryMode }>) {
  return <span className={`${CHIP} ${DELIVERY_MODE_CHIP[deliveryMode]}`}>{DELIVERY_MODE_LABEL[deliveryMode]}</span>
}

export function ServiceListingStatusBadge({ status }: Readonly<{ status: ServiceListingStatus }>) {
  return <span className={`${CHIP} ${LISTING_STATUS_CHIP[status]}`}>{LISTING_STATUS_LABEL[status]}</span>
}

export function ServiceOrderStatusBadge({ status }: Readonly<{ status: ServiceOrderStatus }>) {
  return <span className={`${CHIP} ${ORDER_STATUS_CHIP[status]}`}>{ORDER_STATUS_LABEL[status]}</span>
}
