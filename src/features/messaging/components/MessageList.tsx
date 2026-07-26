import { useEffect, useLayoutEffect, useRef } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { useChatStore } from '../../../stores/chatStore'
import { useMessages } from '../hooks/useMessages'
import { useStompChat } from '../hooks/useStompChat'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { messageApi } from '../api/messageApi'
import { messagingKeys } from '../hooks/useConversations'
import { getErrorMessage } from '../../../lib/utils'
import type { MessageResponse } from '../types'
import type { SpringPage } from '../../social/types'
import type { InfiniteData } from '@tanstack/react-query'

type MessagesInfiniteData = InfiniteData<SpringPage<MessageResponse>>

interface Props {
  conversationId: number
  currentUserId: number
}

export function MessageList({ conversationId, currentUserId }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)
  const prevScrollHeightRef = useRef(0)
  const { typingUsers } = useChatStore()
  const queryClient = useQueryClient()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } =
    useMessages(conversationId)
  useStompChat(conversationId)

  const typingNames = Object.values(typingUsers[conversationId] ?? {})

  // Sort by createdAt ASC so oldest is always at top regardless of backend page order
  const allMessages = (data?.pages.flatMap((p) => p.content) ?? [])
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  // Save scroll height the moment an older-messages fetch begins
  useEffect(() => {
    if (isFetchingNextPage && scrollRef.current) {
      prevScrollHeightRef.current = scrollRef.current.scrollHeight
    }
  }, [isFetchingNextPage])

  // useLayoutEffect runs synchronously after DOM update, before paint —
  // so position is restored before the user ever sees the jump.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || allMessages.length === 0) return

    if (isFirstLoad.current) {
      el.scrollTop = el.scrollHeight
      isFirstLoad.current = false
      return
    }

    if (prevScrollHeightRef.current > 0) {
      // Older messages were prepended — keep the same visual anchor point
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current
      prevScrollHeightRef.current = 0
      return
    }

    // New real-time message — scroll to bottom
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [allMessages.length])

  // Scroll to bottom when typing indicator appears
  useEffect(() => {
    if (typingNames.length > 0) {
      const el = scrollRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [typingNames.length])

  const { mutate: deleteMessage } = useMutation({
    mutationFn: (messageId: number) => messageApi.deleteMessage(messageId),
    onSuccess: (_data, messageId) => {
      queryClient.setQueryData<MessagesInfiniteData>(
        messagingKeys.messagesInfinite(conversationId),
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.filter((m: MessageResponse) => m.id !== messageId),
            })),
          }
        },
      )
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
        <AlertTriangle className="w-6 h-6 text-red-500 mb-1" />
        <p className="text-sm text-red-500 dark:text-red-400">Couldn't load messages</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{getErrorMessage(error)}</p>
        <button onClick={() => refetch()} className="text-xs text-violet-500 hover:underline mt-1">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Load-older button pinned at top */}
      {hasNextPage && (
        <div className="shrink-0 flex justify-center py-2 border-b border-gray-100 dark:border-[#2D1F4D]">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-xs text-violet-500 hover:underline disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load older messages'}
          </button>
        </div>
      )}

      {/* Scrollable message area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {/* Spacer pushes messages to the bottom when there are few of them */}
        <div className="flex-1" />

        {allMessages.length === 0 && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 pb-4">
            No messages yet. Say hello!
          </p>
        )}

        {allMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
            onDelete={msg.senderId === currentUserId ? deleteMessage : undefined}
          />
        ))}

        <TypingIndicator names={typingNames} />
      </div>
    </div>
  )
}
