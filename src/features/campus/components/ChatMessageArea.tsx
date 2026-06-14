import { useRef, useEffect } from 'react'
import { Bot, Loader2 } from 'lucide-react'
import { ChatBubble } from './ChatBubble'
import type { ChatMessage } from '../types'

interface Props {
  messages: ChatMessage[]
  historyLoading: boolean
  isPending: boolean
}

export function ChatMessageArea({ messages, historyLoading, isPending }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isPending])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
      {messages.length > 0 && <div className="flex-1" />}

      {historyLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
        </div>
      )}

      {!historyLoading && messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-[#2D1F4D] flex items-center justify-center">
            <Bot className="w-8 h-8 text-violet-500" />
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Hi! I'm your Campus Assistant
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Ask me anything about your campus — schedules, facilities, events, and more.
          </p>
        </div>
      )}

      {messages.map((msg, i) => (
        <ChatBubble key={i} message={msg} />
      ))}

      {isPending && (
        <div className="flex items-end gap-2">
          <div className="shrink-0 w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="px-3 py-2 rounded-2xl bg-gray-100 dark:bg-[#2D1F4D] rounded-bl-sm">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
