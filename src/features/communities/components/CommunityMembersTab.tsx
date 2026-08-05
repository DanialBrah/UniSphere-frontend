import { Loader2, Users2 } from 'lucide-react'
import { CommunityMemberRow } from './CommunityMemberRow'
import { JoinToViewNotice } from './JoinToViewNotice'
import { useCommunityMembers } from '../hooks/useCommunityMembers'
import { useAuth } from '../../../hooks/useAuth'
import { getErrorMessage } from '../../../lib/utils'
import { isAccessDeniedError } from '../utils/accessError'
import type { CommunityMemberRole } from '../types'

interface Props {
  communityId: number
  viewerRole: CommunityMemberRole | null
}

export function CommunityMembersTab({ communityId, viewerRole }: Props) {
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useCommunityMembers(communityId)

  const members = data?.pages.flatMap((p) => p.content) ?? []

  if (isLoading) {
    return (
      <div className="py-5 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-[#1A1226] animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError && isAccessDeniedError(error, viewerRole)) {
    return (
      <div className="py-5">
        <JoinToViewNotice icon={Users2} label="members" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm text-red-500 dark:text-red-400">Couldn't load members</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{getErrorMessage(error)}</p>
        <button onClick={() => refetch()} className="text-xs text-primary font-medium hover:underline mt-1">
          Retry
        </button>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1E1430] flex items-center justify-center">
          <Users2 size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No members yet</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="py-5 space-y-3">
      {members.map((member) => (
        <CommunityMemberRow
          key={member.userId}
          communityId={communityId}
          member={member}
          viewerRole={viewerRole}
          viewerUserId={user.id}
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
    </div>
  )
}
