import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Settings, Trash2 } from 'lucide-react'
import { JoinRequestRow } from './JoinRequestRow'
import { BanRow } from './BanRow'
import { CreateCommunityModal } from './CreateCommunityModal'
import { ConfirmModal } from './ConfirmModal'
import { useJoinRequests } from '../hooks/useJoinRequests'
import { useCommunityBans } from '../hooks/useCommunityBans'
import { useDeleteCommunity } from '../hooks/useDeleteCommunity'
import { getErrorMessage } from '../../../lib/utils'
import type { CommunityResponse, JoinRequestStatus } from '../types'

type SubTab = 'requests' | 'bans' | 'settings'
const STATUS_OPTIONS: (JoinRequestStatus | 'ALL')[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL']

export function CommunityManageTab({ community }: { community: CommunityResponse }) {
  const navigate = useNavigate()
  const showJoinRequests = community.visibility === 'PRIVATE'
  const [subTab, setSubTab] = useState<SubTab>(showJoinRequests ? 'requests' : 'bans')
  const [statusFilter, setStatusFilter] = useState<JoinRequestStatus | 'ALL'>('PENDING')
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const joinRequests = useJoinRequests(
    community.id,
    statusFilter === 'ALL' ? undefined : statusFilter,
  )
  const bans = useCommunityBans(community.id)
  const { mutate: deleteCommunity, isPending: isDeleting } = useDeleteCommunity()

  const requestItems = joinRequests.data?.pages.flatMap((p) => p.content) ?? []
  const banItems = bans.data?.pages.flatMap((p) => p.content) ?? []

  return (
    <div className="py-5">
      <div className="flex gap-1.5 mb-4">
        {showJoinRequests && (
          <button
            onClick={() => setSubTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'requests'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-[#241a38] text-gray-600 dark:text-gray-300'
            }`}
          >
            Join Requests
          </button>
        )}
        <button
          onClick={() => setSubTab('bans')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            subTab === 'bans'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-[#241a38] text-gray-600 dark:text-gray-300'
          }`}
        >
          Bans
        </button>
        <button
          onClick={() => setSubTab('settings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            subTab === 'settings'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-[#241a38] text-gray-600 dark:text-gray-300'
          }`}
        >
          Settings
        </button>
      </div>

      {subTab === 'requests' && showJoinRequests && (
        <div className="space-y-3">
          <div className="flex gap-1.5">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary/15 text-primary'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {joinRequests.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-[#1A1226] animate-pulse" />
              ))}
            </div>
          )}

          {joinRequests.isError && (
            <p className="text-sm text-red-500 dark:text-red-400 py-4 text-center">
              {getErrorMessage(joinRequests.error)}
            </p>
          )}

          {!joinRequests.isLoading && requestItems.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">
              No join requests here.
            </p>
          )}

          {requestItems.map((r) => (
            <JoinRequestRow key={r.id} communityId={community.id} request={r} />
          ))}

          {joinRequests.hasNextPage && (
            <div className="flex justify-center pt-1">
              <button
                onClick={() => joinRequests.fetchNextPage()}
                disabled={joinRequests.isFetchingNextPage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-primary/40 hover:text-primary disabled:opacity-50 transition-colors"
              >
                {joinRequests.isFetchingNextPage && <Loader2 size={12} className="animate-spin" />}
                Load more
              </button>
            </div>
          )}
        </div>
      )}

      {subTab === 'bans' && (
        <div className="space-y-3">
          {bans.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-[#1A1226] animate-pulse" />
              ))}
            </div>
          )}

          {bans.isError && (
            <p className="text-sm text-red-500 dark:text-red-400 py-4 text-center">
              {getErrorMessage(bans.error)}
            </p>
          )}

          {!bans.isLoading && banItems.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">
              No banned members.
            </p>
          )}

          {banItems.map((b) => (
            <BanRow key={b.userId} communityId={community.id} ban={b} />
          ))}

          {bans.hasNextPage && (
            <div className="flex justify-center pt-1">
              <button
                onClick={() => bans.fetchNextPage()}
                disabled={bans.isFetchingNextPage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-primary/40 hover:text-primary disabled:opacity-50 transition-colors"
              >
                {bans.isFetchingNextPage && <Loader2 size={12} className="animate-spin" />}
                Load more
              </button>
            </div>
          )}
        </div>
      )}

      {subTab === 'settings' && (
        <div className="space-y-3 max-w-sm">
          <button
            onClick={() => setShowEdit(true)}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Settings size={16} />
            Edit community details
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/40 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <Trash2 size={16} />
            Delete community
          </button>
        </div>
      )}

      {showEdit && (
        <CreateCommunityModal existingCommunity={community} onClose={() => setShowEdit(false)} />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete this community?"
          body="This permanently removes the community, its chat, and its announcements. This can't be undone."
          confirmLabel="Delete"
          destructive
          isPending={isDeleting}
          onConfirm={() =>
            deleteCommunity(community.id, { onSuccess: () => navigate('/communities') })
          }
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
