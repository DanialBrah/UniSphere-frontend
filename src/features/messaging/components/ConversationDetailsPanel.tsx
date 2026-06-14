import { useState } from 'react'
import { X, UserPlus, Trash2, Loader2, Crown, UserMinus, ShieldCheck } from 'lucide-react'
import { useConversationMembers, usePromoteMember, useRemoveMember } from '../hooks/useConversationMembers'
import { useDeleteConversation } from '../hooks/useDeleteConversation'
import { AddMemberModal } from './AddMemberModal'
import type { ConversationResponse } from '../types'

interface Props {
  conversation: ConversationResponse
  currentUserId: number
  onClose: () => void
}

function getConvName(conv: ConversationResponse, currentUserId: number) {
  if (conv.convType === 'GROUP') return conv.name ?? 'Group'
  const other = conv.members.find((m) => m.userId !== currentUserId) ?? conv.members[0]
  return other?.displayName ?? 'Unknown'
}

export function ConversationDetailsPanel({ conversation, currentUserId, onClose }: Props) {
  const { data: members, isLoading } = useConversationMembers(conversation.id)
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember(conversation.id)
  const { mutate: promoteMember, isPending: isPromoting } = usePromoteMember(conversation.id)
  const { mutate: deleteConversation, isPending: isDeleting } = useDeleteConversation()
  const [showAddMember, setShowAddMember] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [promotingId, setPromotingId] = useState<number | null>(null)

  const currentMember = conversation.members.find((m) => m.userId === currentUserId)
  const isAdmin = currentMember?.role === 'ADMIN'
  const canDelete =
    conversation.convType === 'DIRECT' ? currentMember !== undefined : isAdmin

  const displayName = getConvName(conversation, currentUserId)
  const memberList = members ?? conversation.members

  const handleRemove = (userId: number) => {
    setRemovingId(userId)
    removeMember(userId, { onSettled: () => setRemovingId(null) })
  }

  const handlePromote = (userId: number) => {
    setPromotingId(userId)
    promoteMember(userId, { onSettled: () => setPromotingId(null) })
  }

  return (
    <>
      <div className="flex flex-col h-full border-l border-gray-200 dark:border-[#2D1F4D] bg-white dark:bg-[#120D1E]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-[#2D1F4D] flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2D1F4D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Conversation info */}
          <div className="px-4 py-5 border-b border-gray-100 dark:border-[#2D1F4D]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-violet-500 flex items-center justify-center text-white text-xl font-bold">
                {displayName.split(' ').filter((w) => w).map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">{displayName}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium">
                {conversation.convType === 'GROUP' ? 'Group' : 'Direct'}
              </span>
            </div>
          </div>

          {/* Members */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Members · {memberList.length}
              </h3>
              {isAdmin && conversation.convType === 'GROUP' && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add
                </button>
              )}
            </div>

            {isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              </div>
            )}

            <div className="flex flex-col gap-1">
              {memberList.map((member) => {
                const isSelf = member.userId === currentUserId
                const memberIsAdmin = member.role === 'ADMIN'
                const initials = member.displayName
                  .split(' ').filter((w) => w).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

                return (
                  <div key={member.userId} className="flex items-center gap-3 py-2 rounded-lg px-2 hover:bg-gray-50 dark:hover:bg-[#1E1430] group">
                    <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-semibold overflow-hidden shrink-0">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.displayName} className="w-full h-full object-cover" />
                      ) : initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {member.displayName}{isSelf ? ' (you)' : ''}
                        </span>
                        {memberIsAdmin && (
                          <span title="Admin"><Crown className="w-3 h-3 text-amber-500 shrink-0" /></span>
                        )}
                      </div>
                    </div>

                    {isAdmin && !isSelf && conversation.convType === 'GROUP' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!memberIsAdmin && (
                          <button
                            onClick={() => handlePromote(member.userId)}
                            disabled={(isPromoting && promotingId === member.userId) || (isRemoving && removingId === member.userId)}
                            className="p-1 rounded text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50"
                            title="Promote to admin"
                          >
                            {isPromoting && promotingId === member.userId
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <ShieldCheck className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(member.userId)}
                          disabled={(isRemoving && removingId === member.userId) || (isPromoting && promotingId === member.userId)}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          title="Remove member"
                        >
                          {isRemoving && removingId === member.userId
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <UserMinus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Danger zone */}
        {canDelete && (
          <div className="px-4 py-4 border-t border-gray-100 dark:border-[#2D1F4D] shrink-0">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete conversation
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteConversation(conversation.id)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddMember && (
        <AddMemberModal
          conversation={conversation}
          onClose={() => setShowAddMember(false)}
        />
      )}
    </>
  )
}
