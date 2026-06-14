import { formatDistanceToNow } from 'date-fns'
import type { MessageResponse } from '../types'

interface Props {
  message: MessageResponse
  isOwn: boolean
  onDelete?: (id: number) => void
}

export function MessageBubble({ message, isOwn, onDelete }: Props) {
  const ts = message.createdAt.endsWith('Z') || message.createdAt.includes('+')
    ? message.createdAt
    : message.createdAt + 'Z'
  const time = formatDistanceToNow(new Date(ts), { addSuffix: true })

  const initials = message.senderName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const avatarEl = (
    <div className="shrink-0 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
      {message.senderAvatar ? (
        <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )

  return (
    // Full-width row so max-w-[65%] below resolves against the panel width, not the bubble itself
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col gap-0.5 max-w-[65%]">
        {/* Sender name — offset right of avatar */}
        <span
          className={`text-xs font-medium text-gray-500 dark:text-gray-400 px-1 truncate ${
            isOwn ? 'text-right mr-10' : 'text-left ml-10'
          }`}
        >
          {message.senderName}
        </span>

        {/* Avatar + bubble row — avatar aligns to bubble bottom */}
        <div className={`group flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {avatarEl}

          <div className="relative min-w-0">
            <div
              className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                isOwn
                  ? 'bg-violet-600 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-[#2D1F4D] text-gray-900 dark:text-gray-100 rounded-bl-none'
              }`}
            >
              {message.content && <p>{message.content}</p>}
              {message.mediaUrl && (
                <img src={message.mediaUrl} alt="attachment" className="max-w-full rounded-lg mt-1" />
              )}
            </div>

            {isOwn && onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="absolute top-1 -left-5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 text-xs"
                title="Delete"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Timestamp — offset to sit under the bubble */}
        <span
          className={`text-[11px] text-gray-400 dark:text-gray-500 px-1 ${
            isOwn ? 'text-right mr-10' : 'text-left ml-10'
          }`}
        >
          {time}
        </span>
      </div>
    </div>
  )
}
