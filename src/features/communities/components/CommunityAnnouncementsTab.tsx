import { useState } from 'react'
import { Loader2, Megaphone, Plus } from 'lucide-react'
import { CommunityAnnouncementCard } from './CommunityAnnouncementCard'
import { CreateAnnouncementModal } from './CreateAnnouncementModal'
import { JoinToViewNotice } from './JoinToViewNotice'
import { useCommunityAnnouncements } from '../hooks/useCommunityAnnouncements'
import { useCommunityAnnouncementsSubscription } from '../hooks/useCommunityAnnouncementsSubscription'
import { getErrorMessage } from '../../../lib/utils'
import { isAccessDeniedError } from '../utils/accessError'
import type { CommunityMemberRole } from '../types'

interface Props {
  communityId: number
  viewerRole: CommunityMemberRole | null
  canManage: boolean
}

export function CommunityAnnouncementsTab({ communityId, viewerRole, canManage }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading, isError, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useCommunityAnnouncements(communityId)
  useCommunityAnnouncementsSubscription(communityId)

  const announcements = data?.pages.flatMap((p) => p.content) ?? []
  const isAccessDenied = isError && isAccessDeniedError(error, viewerRole)

  if (isAccessDenied) {
    return (
      <div className="py-5">
        <JoinToViewNotice icon={Megaphone} label="announcements" />
      </div>
    )
  }

  return (
    <div className="py-5 space-y-3">
      {canManage && (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-[#2D1F4D] text-sm text-gray-500 dark:text-gray-400 hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Plus size={16} />
          New announcement
        </button>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-[#1A1226] animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-sm text-red-500 dark:text-red-400">Couldn't load announcements</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{getErrorMessage(error)}</p>
          <button onClick={() => refetch()} className="text-xs text-primary font-medium hover:underline mt-1">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && announcements.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1E1430] flex items-center justify-center">
            <Megaphone size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No announcements yet</p>
        </div>
      )}

      {announcements.map((a) => (
        <CommunityAnnouncementCard
          key={a.id}
          communityId={communityId}
          announcement={a}
          canManage={canManage}
        />
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-primary/40 hover:text-primary disabled:opacity-50 transition-colors"
          >
            {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {showCreate && (
        <CreateAnnouncementModal communityId={communityId} onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}
