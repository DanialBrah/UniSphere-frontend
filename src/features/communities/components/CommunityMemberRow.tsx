import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical } from 'lucide-react'
import { CommunityRoleBadge } from './CommunityRoleBadge'
import { ConfirmModal } from './ConfirmModal'
import { BanMemberModal } from './BanMemberModal'
import { useChangeMemberRole } from '../hooks/useChangeMemberRole'
import { useKickMember } from '../hooks/useKickMember'
import { canManageMember } from '../utils/roleHierarchy'
import type { CommunityMemberResponse, CommunityMemberRole } from '../types'

interface Props {
  communityId: number
  member: CommunityMemberResponse
  viewerRole: CommunityMemberRole | null
  viewerUserId: number
}

const PROMOTE_TO: Partial<Record<CommunityMemberRole, CommunityMemberRole>> = {
  MEMBER: 'MODERATOR',
  MODERATOR: 'ADMIN',
}
const DEMOTE_TO: Partial<Record<CommunityMemberRole, CommunityMemberRole>> = {
  ADMIN: 'MODERATOR',
  MODERATOR: 'MEMBER',
}

export function CommunityMemberRow({ communityId, member, viewerRole, viewerUserId }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showKickConfirm, setShowKickConfirm] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const { mutate: changeRole } = useChangeMemberRole(communityId)
  const { mutate: kick, isPending: isKicking } = useKickMember(communityId)

  const isSelf = member.userId === viewerUserId
  const canManage = !isSelf && canManageMember(viewerRole, member.role)
  // Role-change endpoint is ADMIN-only regardless of the general hierarchy rule
  const canChangeRole = !isSelf && viewerRole === 'ADMIN'
  const promoteTo = PROMOTE_TO[member.role]
  const demoteTo = DEMOTE_TO[member.role]

  const hasMenu = canManage || canChangeRole
  const timestamp = formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#130D22] border border-gray-200 dark:border-[#2D1F4D]">
      <Link to={`/profile/${member.userId}`} className="shrink-0">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt={member.displayName} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {member.displayName.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/profile/${member.userId}`} className="flex items-center gap-1.5 min-w-0 hover:underline w-fit">
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {member.displayName}
          </span>
          <CommunityRoleBadge role={member.role} />
        </Link>
        <p className="text-xs text-gray-400 dark:text-gray-500">Joined {timestamp}</p>
      </div>

      {hasMenu && (
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-44 rounded-xl bg-white dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D] shadow-lg overflow-hidden">
                {canChangeRole && promoteTo && (
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      changeRole({ userId: member.userId, role: promoteTo })
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Promote to {promoteTo === 'ADMIN' ? 'Admin' : 'Moderator'}
                  </button>
                )}
                {canChangeRole && demoteTo && (
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      changeRole({ userId: member.userId, role: demoteTo })
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Demote to {demoteTo === 'MODERATOR' ? 'Moderator' : 'Member'}
                  </button>
                )}
                {canManage && (
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      setShowKickConfirm(true)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Remove from community
                  </button>
                )}
                {canManage && (
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      setShowBanModal(true)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    Ban
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {showKickConfirm && (
        <ConfirmModal
          title={`Remove ${member.displayName}?`}
          body="They'll lose access to this community's posts and chat, but can rejoin later."
          confirmLabel="Remove"
          destructive
          isPending={isKicking}
          onConfirm={() => kick(member.userId, { onSuccess: () => setShowKickConfirm(false) })}
          onCancel={() => setShowKickConfirm(false)}
        />
      )}

      {showBanModal && (
        <BanMemberModal
          communityId={communityId}
          userId={member.userId}
          displayName={member.displayName}
          onClose={() => setShowBanModal(false)}
        />
      )}
    </div>
  )
}
