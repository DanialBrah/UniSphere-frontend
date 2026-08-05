import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Trash2, Users2 } from 'lucide-react'
import { CommunityVisibilityBadge } from './CommunityVisibilityBadge'
import { CommunityMembershipButton } from './CommunityMembershipButton'
import { CreateCommunityModal } from './CreateCommunityModal'
import { ConfirmModal } from './ConfirmModal'
import { useDeleteCommunity } from '../hooks/useDeleteCommunity'
import type { CommunityResponse } from '../types'

export function CommunityBannerHeader({ community }: { community: CommunityResponse }) {
  const navigate = useNavigate()
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { mutate: deleteCommunity, isPending: isDeleting } = useDeleteCommunity()

  const isAdmin = community.viewerRole === 'ADMIN'

  return (
    <div className="rounded-2xl bg-white dark:bg-[#130D22] border border-gray-200 dark:border-[#2D1F4D] overflow-hidden">
      {community.bannerUrl ? (
        <img src={community.bannerUrl} alt="" className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-violet-400/20 dark:from-primary/10 dark:to-violet-900/20" />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {community.name}
              </h1>
              <CommunityVisibilityBadge visibility={community.visibility} />
            </div>
            <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-1">
              <Users2 size={12} />
              {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
              {' · created by '}
              {community.creatorName}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowEdit(true)}
                  aria-label="Community settings"
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <Settings size={16} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="Delete community"
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <CommunityMembershipButton community={community} />
          </div>
        </div>

        {community.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-wrap">
            {community.description}
          </p>
        )}
      </div>

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
