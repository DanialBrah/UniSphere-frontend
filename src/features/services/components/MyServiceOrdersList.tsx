import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, TriangleAlert } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { MyServiceOrderCard } from './MyServiceOrderCard'
import { ServiceRosterRowSkeleton } from './ServiceSkeleton'
import { ServiceErrorState, ServiceStateBlock } from './ServiceStateBlocks'
import { useMyServiceOrders, useReceivedServiceOrders } from '../hooks/useServiceOrders'
import { ORDER_STATUS_LABEL, ORDER_STATUS_ORDER } from '../utils/display'
import type { ServiceOrderResponse, ServiceOrderStatus, SpringPage } from '../types'

const CHIP_BASE = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

const flatten = (data?: InfiniteData<SpringPage<ServiceOrderResponse>>): ServiceOrderResponse[] =>
  data?.pages.flatMap((page) => page.content) ?? []

interface MyServiceOrdersListProps {
  /** 'client' -> `/services/orders/me` ("My Orders"); 'provider' -> `/services/orders/received`. */
  perspective: 'client' | 'provider'
}

/** The "My Orders" / "Orders Received" tab — every order the caller is party to, across every listing. */
export function MyServiceOrdersList({ perspective }: Readonly<MyServiceOrdersListProps>) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<ServiceOrderStatus | null>(null)
  const clientQuery = useMyServiceOrders(status, perspective === 'client')
  const providerQuery = useReceivedServiceOrders(status, perspective === 'provider')
  const query = perspective === 'client' ? clientQuery : providerQuery

  const orders = flatten(query.data)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setStatus(null)} className={`${CHIP_BASE} ${status === null ? CHIP_ACTIVE : CHIP_IDLE}`}>
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
    </div>
  )

  function renderBody() {
    if (query.isPending && query.fetchStatus !== 'idle') {
      return (
        <div className="space-y-3">
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
          hint={
            perspective === 'client'
              ? 'When you request a service, it shows up here.'
              : 'Orders placed against your listings show up here.'
          }
          actionLabel="Browse services"
          onAction={() => navigate('/services')}
        />
      )
    }

    return (
      <>
        <div className="space-y-3">
          {orders.map((order) => (
            <MyServiceOrderCard key={order.id} order={order} perspective={perspective} />
          ))}
        </div>

        {query.hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
            >
              {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </>
    )
  }
}
