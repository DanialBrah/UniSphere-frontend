import { Link } from 'react-router-dom'
import { ServiceOrderStatusBadge } from './ServiceBadges'
import { formatServiceDateTime } from '../utils/dateUtils'
import { formatServicePrice } from '../utils/display'
import type { ServiceOrderResponse } from '../types'

interface MyServiceOrderCardProps {
  order: ServiceOrderResponse
  /** Which counterpart to show — the client sees the provider, the provider sees the client. */
  perspective: 'client' | 'provider'
}

/** One row in "My Orders" (as client) or "Orders Received" (as provider). */
export function MyServiceOrderCard({ order, perspective }: Readonly<MyServiceOrderCardProps>) {
  const counterpart = perspective === 'client' ? order.provider : order.client
  const counterpartLabel = perspective === 'client' ? 'Provider' : 'Client'

  return (
    <Link
      to={`/services/orders/${order.id}`}
      className="block space-y-2 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{order.listingTitle}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {counterpartLabel}: {counterpart?.displayName ?? 'Unknown'}
          </p>
        </div>
        <ServiceOrderStatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Placed {formatServiceDateTime(order.createdAt)}</span>
        {order.agreedPrice != null && (
          <span className="font-medium text-gray-900 dark:text-white">
            {formatServicePrice(order.agreedPrice, 'FIXED')}
          </span>
        )}
      </div>
    </Link>
  )
}
