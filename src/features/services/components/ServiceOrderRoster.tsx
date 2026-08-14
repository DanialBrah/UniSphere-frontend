import { useState } from 'react'
import { ClipboardList, TriangleAlert } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { ServiceOrderRow } from './ServiceOrderRow'
import { ServiceRosterRowSkeleton } from './ServiceSkeleton'
import { ServiceErrorState, ServiceStateBlock } from './ServiceStateBlocks'
import { useServiceOrderRoster } from '../hooks/useServiceOrders'
import { ORDER_STATUS_LABEL, ORDER_STATUS_ORDER } from '../utils/display'
import type { ServiceOrderResponse, ServiceOrderStatus, SpringPage } from '../types'

const CHIP_BASE = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

const flatten = (data?: InfiniteData<SpringPage<ServiceOrderResponse>>): ServiceOrderResponse[] =>
  data?.pages.flatMap((page) => page.content) ?? []

/** Owner/ADMIN-only order roster for one listing — status-filterable. */
export function ServiceOrderRoster({ listingId }: Readonly<{ listingId: number }>) {
  const [status, setStatus] = useState<ServiceOrderStatus | null>(null)
  const query = useServiceOrderRoster(listingId, status, true)
  const orders = flatten(query.data)

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        <ClipboardList className="h-4 w-4 text-primary" />
        Orders
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatus(null)}
          className={`${CHIP_BASE} ${status === null ? CHIP_ACTIVE : CHIP_IDLE}`}
        >
          All
        </button>
        {ORDER_STATUS_ORDER.map((value) => {
          const active = status === value
          return (
            <button
              key={value}
              onClick={() => setStatus(active ? null : value)}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {ORDER_STATUS_LABEL[value]}
            </button>
          )
        })}
      </div>

      {renderBody()}
    </section>
  )

  function renderBody() {
    if (query.isPending && query.fetchStatus !== 'idle') {
      return (
        <div className="space-y-2">
          <ServiceRosterRowSkeleton />
          <ServiceRosterRowSkeleton />
        </div>
      )
    }

    if (query.isError) {
      return (
        <ServiceErrorState
          icon={TriangleAlert}
          title="Couldn't load orders"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )
    }

    if (orders.length === 0) {
      return (
        <ServiceStateBlock
          icon={ClipboardList}
          title={status ? `No ${ORDER_STATUS_LABEL[status].toLowerCase()} orders` : 'No orders yet'}
        />
      )
    }

    return (
      <>
        <div className="space-y-2">
          {orders.map((order) => (
            <ServiceOrderRow key={order.id} order={order} />
          ))}
        </div>

        {query.hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
            >
              {query.isFetchingNextPage ? 'Loading…' : 'Load more orders'}
            </button>
          </div>
        )}
      </>
    )
  }
}
