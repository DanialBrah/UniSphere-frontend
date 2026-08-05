import { useState } from 'react'
import { Loader2, LogOut } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { RequestToJoinModal } from './RequestToJoinModal'
import { useJoinCommunity } from '../hooks/useJoinCommunity'
import { useLeaveCommunity } from '../hooks/useLeaveCommunity'
import type { CommunityResponse } from '../types'

export function CommunityMembershipButton({ community }: { community: CommunityResponse }) {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const { mutate: join, isPending: isJoining } = useJoinCommunity(community.id)
  const { mutate: leave, isPending: isLeaving } = useLeaveCommunity(community.id)

  if (community.viewerRole != null) {
    return (
      <>
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-red-300 hover:text-red-500 dark:hover:border-red-900/50 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={14} />
          Leave
        </button>

        {showLeaveConfirm && (
          <ConfirmModal
            title="Leave this community?"
            body="You'll need to rejoin (or request to join, if it's private) to see its posts and chat again."
            confirmLabel="Leave"
            destructive
            isPending={isLeaving}
            onConfirm={() => leave(undefined, { onSuccess: () => setShowLeaveConfirm(false) })}
            onCancel={() => setShowLeaveConfirm(false)}
          />
        )}
      </>
    )
  }

  if (community.visibility === 'PRIVATE') {
    if (community.hasPendingJoinRequest) {
      return (
        <span className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#241a38] text-sm font-medium text-gray-500 dark:text-gray-400">
          Request pending
        </span>
      )
    }
    return (
      <>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          Request to join
        </button>
        {showRequestModal && (
          <RequestToJoinModal
            communityId={community.id}
            communityName={community.name}
            onClose={() => setShowRequestModal(false)}
          />
        )}
      </>
    )
  }

  return (
    <button
      onClick={() => join()}
      disabled={isJoining}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
    >
      {isJoining && <Loader2 size={14} className="animate-spin" />}
      Join community
    </button>
  )
}
