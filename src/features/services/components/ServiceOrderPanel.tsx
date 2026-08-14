import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, MessageCircle } from 'lucide-react'
import { RequestServiceModal } from './RequestServiceModal'
import { useInquireService } from '../hooks/useServiceMutations'
import { useAuth } from '../../../hooks/useAuth'
import { useChatStore } from '../../../stores/chatStore'
import { canOrderService } from '../utils/permissions'
import type { ServiceListingResponse } from '../types'

const PANEL = 'rounded-2xl border p-4'
const NEUTRAL_PANEL = `${PANEL} border-gray-200 bg-gray-50 dark:border-[#2D1F4D] dark:bg-white/5`

function NoticePanel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={NEUTRAL_PANEL}>
      <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{children}</span>
      </p>
    </div>
  )
}

/**
 * The two ways a non-owner reaches out — "Message the provider" (no order, always available) and
 * "Request this service" (a tracked order, gated to non-ADMIN roles). Both land the caller in the
 * same existing messaging feature; nothing here builds a new chat surface. The direct Services
 * analogue of `jobs/components/JobApplyPanel.tsx`, but with two CTAs instead of one since the
 * backend itself exposes two distinct actions (`/inquire` and `/orders`).
 */
export function ServiceOrderPanel({ listing }: Readonly<{ listing: ServiceListingResponse }>) {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const setActiveConversation = useChatStore((s) => s.setActive)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const isOwner = user?.id === listing.provider.id
  const inquire = useInquireService(listing.id)

  if (isOwner) {
    return (
      <NoticePanel>
        You provide this service, so there's nothing to request here — see the Manage tab for
        incoming orders.
      </NoticePanel>
    )
  }

  if (listing.status === 'PAUSED') {
    return <NoticePanel>This listing is paused. It isn't accepting new orders right now.</NoticePanel>
  }

  function handleMessage() {
    inquire.mutate(undefined, {
      onSuccess: (conversation) => {
        setActiveConversation(conversation.id)
        navigate('/messages')
      },
    })
  }

  return (
    <>
      <div className={`${PANEL} space-y-2.5 border-gray-200 dark:border-[#2D1F4D]`}>
        <button
          type="button"
          onClick={handleMessage}
          disabled={inquire.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
        >
          <MessageCircle className="h-4 w-4" />
          Message provider
        </button>

        {canOrderService(user) ? (
          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Request this service
          </button>
        ) : (
          role === 'ADMIN' && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Admin accounts can message providers but can't place orders.
            </p>
          )
        )}
      </div>

      {showRequestModal && <RequestServiceModal listing={listing} onClose={() => setShowRequestModal(false)} />}
    </>
  )
}
