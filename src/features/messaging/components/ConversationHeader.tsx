import { Info } from 'lucide-react'
import type { ConversationResponse } from '../types'

interface Props {
  conversation: ConversationResponse
  currentUserId: number
  onInfoClick: () => void
}

function getDisplayInfo(conv: ConversationResponse, currentUserId: number) {
  if (conv.convType === 'GROUP') return { name: conv.name ?? 'Group', avatar: null }
  const other = conv.members.find((m) => m.userId !== currentUserId) ?? conv.members[0]
  return { name: other?.displayName ?? 'Unknown', avatar: other?.avatarUrl ?? null }
}

export function ConversationHeader({ conversation, currentUserId, onInfoClick }: Props) {
  const { name, avatar } = getDisplayInfo(conversation, currentUserId)
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-[#2D1F4D] flex items-center gap-3 shrink-0">
      <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">{name}</p>
        {conversation.convType === 'GROUP' && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{conversation.members.length} members</p>
        )}
      </div>

      <button
        onClick={onInfoClick}
        title="Conversation details"
        className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors shrink-0"
      >
        <Info className="w-4 h-4" />
      </button>
    </div>
  )
}
