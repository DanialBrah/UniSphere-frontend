import { useState } from 'react'
import { CheckCircle2, Play, TriangleAlert, XCircle } from 'lucide-react'
import { ServiceOrderDecisionModal } from './ServiceOrderDecisionModal'
import { useUpdateServiceOrderStatus } from '../hooks/useServiceOrders'
import { acceptNeedsAgreedPrice, allowedOrderStatusTargets } from '../utils/permissions'
import { ORDER_STATUS_LABEL } from '../utils/display'
import type { ServiceOrderResponse, ServiceOrderStatus } from '../types'

const ACTION_BUTTON =
  'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-primary-50'

const ACTION_ICON: Record<Exclude<ServiceOrderStatus, 'PENDING'>, typeof CheckCircle2> = {
  ACCEPTED: CheckCircle2,
  IN_PROGRESS: Play,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
  DISPUTED: TriangleAlert,
}

interface ServiceOrderStatusActionsProps {
  order: ServiceOrderResponse
  isProviderOrAdmin: boolean
  isClient: boolean
}

/**
 * Renders only the buttons the current viewer may legally press for this order's current status —
 * a direct mirror of `allowedOrderStatusTargets`, which itself mirrors
 * `ServiceOrderService.updateOrderStatus`'s FSM exactly.
 */
export function ServiceOrderStatusActions({
  order,
  isProviderOrAdmin,
  isClient,
}: Readonly<ServiceOrderStatusActionsProps>) {
  const [pendingTarget, setPendingTarget] = useState<Exclude<ServiceOrderStatus, 'PENDING'> | null>(null)
  const updateStatus = useUpdateServiceOrderStatus(order.id, order.listingId)

  const targets = allowedOrderStatusTargets(order.status, isProviderOrAdmin, isClient)
  if (targets.length === 0) return null

  const needsAgreedPrice = pendingTarget === 'ACCEPTED' && acceptNeedsAgreedPrice(order)

  return (
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Update this order</h2>

      <div className="flex flex-wrap gap-2">
        {targets.map((target) => {
          const Icon = ACTION_ICON[target]
          return (
            <button key={target} onClick={() => setPendingTarget(target)} className={ACTION_BUTTON}>
              <Icon className="h-4 w-4" />
              {ORDER_STATUS_LABEL[target]}
            </button>
          )
        })}
      </div>

      {pendingTarget && (
        <ServiceOrderDecisionModal
          order={order}
          target={pendingTarget}
          needsAgreedPrice={needsAgreedPrice}
          isPending={updateStatus.isPending}
          onCancel={() => setPendingTarget(null)}
          onConfirm={(reason, agreedPrice) =>
            updateStatus.mutate(
              { status: pendingTarget, reason, agreedPrice },
              { onSuccess: () => setPendingTarget(null) },
            )
          }
        />
      )}
    </section>
  )
}
