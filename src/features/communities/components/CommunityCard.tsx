import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users2, Loader2 } from 'lucide-react'
import { CommunityVisibilityBadge } from './CommunityVisibilityBadge'
import { RequestToJoinModal } from './RequestToJoinModal'
import { useJoinCommunity } from '../hooks/useJoinCommunity'
import type { CommunityResponse } from '../types'

export function CommunityCard({ community }: { community: CommunityResponse }) {
  const [showRequestModal, setShowRequestModal] = useState(false)
  const { mutate: join, isPending: isJoining } = useJoinCommunity(community.id)

  return (
    <div className="flex flex-col rounded-2xl bg-white dark:bg-[#130D22] border border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 transition-colors overflow-hidden">
      <Link to={`/community/${community.id}`} className="flex-1">
        {community.bannerUrl ? (
          <img src={community.bannerUrl} alt="" className="w-full h-24 object-cover" />
        ) : (
          <div className="w-full h-24 bg-gradient-to-br from-primary/20 to-violet-400/20 dark:from-primary/10 dark:to-violet-900/20" />
        )}
        <div className="p-3.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {community.name}
            </h3>
            <CommunityVisibilityBadge visibility={community.visibility} />
          </div>
          {community.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {community.description}
            </p>
          )}
          <p className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 pt-0.5">
            <Users2 size={11} />
            {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
      </Link>

      <div className="px-3.5 pb-3.5">
        {community.viewerRole != null ? (
          <span className="inline-flex w-full justify-center py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/10">
            {community.viewerRole === 'ADMIN' ? "You're the admin" : "You're a member"}
          </span>
        ) : community.visibility === 'PRIVATE' ? (
          community.hasPendingJoinRequest ? (
            <span className="inline-flex w-full justify-center py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#241a38]">
              Request pending
            </span>
          ) : (
            <button
              onClick={() => setShowRequestModal(true)}
              className="w-full py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-700 transition-colors"
            >
              Request to join
            </button>
          )
        ) : (
          <button
            onClick={() => join()}
            disabled={isJoining}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isJoining && <Loader2 size={12} className="animate-spin" />}
            Join
          </button>
        )}
      </div>

      {showRequestModal && (
        <RequestToJoinModal
          communityId={community.id}
          communityName={community.name}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </div>
  )
}
