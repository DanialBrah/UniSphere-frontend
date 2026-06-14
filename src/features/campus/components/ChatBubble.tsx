import { formatDistanceToNow } from 'date-fns'
import { Bot } from 'lucide-react'
import type { ChatMessage } from '../types'

interface Props {
  message: ChatMessage
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user'
  const time = message.timestamp
    ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
    : 'earlier'

  const avatarEl = (
    <div
      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-violet-500' : 'bg-violet-600'
      }`}
    >
      {isUser ? (
        <span className="text-white text-xs font-semibold">U</span>
      ) : (
        <Bot className="w-4 h-4 text-white" />
      )}
    </div>
  )

  return (
    // Full-width row so max-w-[70%] below resolves against the panel width, not the bubble itself
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col gap-0.5 max-w-[70%]">
        {/* Display name — offset right of avatar */}
        <span
          className={`text-xs font-medium text-gray-500 dark:text-gray-400 px-1 ${
            isUser ? 'text-right mr-10' : 'text-left ml-10'
          }`}
        >
          {isUser ? 'You' : 'Campus Assistant'}
        </span>

        {/* Avatar + bubble row — avatar aligns to bubble bottom */}
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {avatarEl}

          <div
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words min-w-0 ${
              isUser
                ? 'bg-violet-600 text-white rounded-br-none'
                : 'bg-gray-100 dark:bg-[#2D1F4D] text-gray-900 dark:text-gray-100 rounded-bl-none'
            }`}
          >
            {message.text}
          </div>
        </div>

        {/* Timestamp */}
        <span
          className={`text-[11px] text-gray-400 dark:text-gray-500 px-1 ${
            isUser ? 'text-right mr-10' : 'text-left ml-10'
          }`}
        >
          {time}
        </span>
      </div>
    </div>
  )
}
