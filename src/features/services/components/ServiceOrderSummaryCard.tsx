import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, MessageCircle } from 'lucide-react'
import { ServiceOrderStatusBadge } from './ServiceBadges'
import { useChatStore } from '../../../stores/chatStore'
import { getInitials } from '../../../lib/userDisplay'
import { formatServiceDateTime } from '../utils/dateUtils'
import { formatServicePrice } from '../utils/display'
import type { ServiceOrderResponse } from '../types'

function PartyBlock({
  label,
  party,
}: Readonly<{ label: string; party: { id: number; displayName: string; avatarUrl: string | null } | null }>) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
      {party ? (
        <Link to={`/profile/${party.id}`} className="mt-1 flex items-center gap-2">
          {party.avatarUrl ? (
            <img src={party.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary dark:bg-primary/20">
              {getInitials(party.displayName)}
            </div>
          )}
          <span className="text-sm font-medium text-gray-900 hover:text-primary dark:text-white">
            {party.displayName}
          </span>
        </Link>
      ) : (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Unknown</p>
      )}
    </div>
  )
}

export function ServiceOrderSummaryCard({ order }: Readonly<{ order: ServiceOrderResponse }>) {
  const navigate = useNavigate()
  const setActiveConversation = useChatStore((s) => s.setActive)

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Order #{order.id}</p>
          <Link
            to={`/services/${order.listingId}`}
            className="text-sm font-semibold text-gray-900 hover:text-primary dark:text-white"
          >
            {order.listingTitle}
          </Link>
        </div>
        <ServiceOrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PartyBlock label="Client" party={order.client} />
        <PartyBlock label="Provider" party={order.provider} />
      </div>

      {order.requirements && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Requirements
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{order.requirements}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Price</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {order.agreedPrice != null ? formatServicePrice(order.agreedPrice, 'FIXED') : 'Not yet agreed'}
          </p>
        </div>
        {order.scheduledAt && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Scheduled
            </p>
            <p className="flex items-center gap-1 text-gray-900 dark:text-white">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatServiceDateTime(order.scheduledAt)}
            </p>
          </div>
        )}
      </div>

      {order.decisionReason && (
        <p className="text-xs text-gray-500 dark:text-gray-400">&ldquo;{order.decisionReason}&rdquo;</p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Placed {formatServiceDateTime(order.createdAt)} · Updated {formatServiceDateTime(order.updatedAt)}
      </p>

      {order.conversationId != null && (
        <button
          type="button"
          onClick={() => {
            setActiveConversation(order.conversationId!)
            navigate('/messages')
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-primary-50"
        >
          <MessageCircle className="h-4 w-4" />
          Open conversation
        </button>
      )}
    </div>
  )
}
