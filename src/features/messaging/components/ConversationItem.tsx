import { formatDistanceToNow } from 'date-fns'
import { useChatStore } from '../../../stores/chatStore'
import type { ConversationResponse } from '../types'

interface Props {
  conversation: ConversationResponse
  currentUserId: number
  isActive: boolean
  onClick: () => void
}

function getDisplayInfo(conv: ConversationResponse, currentUserId: number) {
  if (conv.convType === 'GROUP') {
    return { name: conv.name ?? 'Group', avatar: null }
  }
  const other = conv.members.find((m) => m.userId !== currentUserId) ?? conv.members[0]
  return { name: other?.displayName ?? 'Unknown', avatar: other?.avatarUrl ?? null }
}

export function ConversationItem({ conversation, currentUserId, isActive, onClick }: Props) {
  const { unreadCounts } = useChatStore()
  const unread = unreadCounts[conversation.id] ?? 0
  const { name, avatar } = getDisplayInfo(conversation, currentUserId)

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const lastMsg = conversation.lastMessage
  const lastTime = lastMsg ? formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true }) : ''
  const preview = lastMsg?.content ?? (lastMsg?.mediaUrl ? '📷 Image' : '')

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive
          ? 'bg-violet-50 dark:bg-[#2D1F4D]'
          : 'hover:bg-gray-50 dark:hover:bg-[#1E1430]'
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-violet-600 rounded-full border-2 border-white dark:border-[#130D22]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-medium truncate ${isActive ? 'text-violet-700 dark:text-violet-300' : 'text-gray-900 dark:text-gray-100'}`}>
            {name}
          </span>
          {lastTime && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">{lastTime}</span>
          )}
        </div>
        {preview && (
          <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
            {preview}
          </p>
        )}
      </div>
    </button>
  )
}
