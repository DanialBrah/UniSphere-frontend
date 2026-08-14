import { Link } from 'react-router-dom'
import { ServiceOrderStatusBadge } from './ServiceBadges'
import { getInitials } from '../../../lib/userDisplay'
import { formatServiceDateTime } from '../utils/dateUtils'
import { formatServicePrice } from '../utils/display'
import type { ServiceOrderResponse } from '../types'

/**
 * One row in a listing's order roster — links straight to `/services/orders/:orderId` for the
 * actual state-machine actions, rather than embedding a decision modal inline. Orders are a
 * first-class, directly-addressable resource (`GET /orders/{orderId}`), unlike Lost & Found's
 * claims, so there's no need for Jobs' inline-roster-decision pattern here.
 */
export function ServiceOrderRow({ order }: Readonly<{ order: ServiceOrderResponse }>) {
  return (
    <Link
      to={`/services/orders/${order.id}`}
      className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 transition-colors hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226]"
    >
      {order.client.avatarUrl ? (
        <img src={order.client.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary dark:bg-primary/20">
          {getInitials(order.client.displayName)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{order.client.displayName}</p>
        <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
          {formatServiceDateTime(order.createdAt)}
          {order.requirements ? ` · ${order.requirements}` : ''}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {order.agreedPrice != null && (
          <p className="text-xs font-semibold text-gray-900 dark:text-white">
            {formatServicePrice(order.agreedPrice, 'FIXED')}
          </p>
        )}
        <ServiceOrderStatusBadge status={order.status} />
      </div>
    </Link>
  )
}
