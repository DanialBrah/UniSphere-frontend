import { useEffect, useState } from 'react'
import { MessageSquare, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useAuth } from '../../../hooks/useAuth'
import { useChatStore } from '../../../stores/chatStore'
import { ConversationList } from '../components/ConversationList'
import { ConversationHeader } from '../components/ConversationHeader'
import { ConversationDetailsPanel } from '../components/ConversationDetailsPanel'
import { MessageList } from '../components/MessageList'
import { MessageInput } from '../components/MessageInput'
import { useActiveConversation } from '../hooks/useActiveConversation'
import { useSendMessage } from '../hooks/useSendMessage'
import { useMarkRead } from '../hooks/useMarkRead'
import { getErrorMessage } from '../../../lib/utils'

export default function MessagesPage() {
  const { user } = useAuth()
  const { activeConversationId, setActive, clearUnread } = useChatStore()
  const {
    data: activeConv,
    isError: isActiveConvError,
    error: activeConvError,
    refetch: refetchActiveConv,
  } = useActiveConversation(activeConversationId)
  const { mutate: sendMessage } = useSendMessage()
  const { mutate: markRead } = useMarkRead()
  const [detailsForId, setDetailsForId] = useState<number | null>(null)
  // Panel is open only when the pinned ID matches the active conversation
  const showDetails = detailsForId !== null && detailsForId === activeConversationId

  const toggleDetails = () =>
    setDetailsForId((prev) =>
      prev === activeConversationId ? null : activeConversationId,
    )
  const closeDetails = () => setDetailsForId(null)

  useEffect(() => {
    if (activeConversationId) clearUnread(activeConversationId)
  }, [activeConversationId, clearUnread])

  // Tell the server which messages have been read.
  // Fires when the conversation opens and again whenever lastMessageId advances
  // (the conversations list refetches after every new STOMP message), so messages
  // received while the conversation is open are also marked immediately.
  const lastMessageId = activeConv?.lastMessage?.id
  useEffect(() => {
    if (!activeConversationId || lastMessageId === undefined) return
    markRead({ conversationId: activeConversationId, lastReadMessageId: lastMessageId })
  }, [activeConversationId, lastMessageId, markRead])

  useEffect(() => {
    return () => { setActive(null) }
  }, [setActive])

  if (!user) return null

  const handleSend = (content: string) => {
    if (activeConversationId) sendMessage({ conversationId: activeConversationId, content, msgType: 'TEXT' })
  }

  return (
    <DashboardLayout>
      <div className="h-full flex overflow-hidden bg-white dark:bg-[#120D1E]">
        {/* Conversation list */}
        <div className="w-72 shrink-0 flex flex-col border-r border-gray-200 dark:border-[#2D1F4D] h-full">
          <ConversationList
            currentUserId={user.id}
            activeConversationId={activeConversationId}
            onSelect={setActive}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {activeConversationId && activeConv ? (
            <>
              <ConversationHeader
                conversation={activeConv}
                currentUserId={user.id}
                onInfoClick={toggleDetails}
              />
              <MessageList conversationId={activeConversationId} currentUserId={user.id} />
              <MessageInput conversationId={activeConversationId} onSend={handleSend} />
            </>
          ) : activeConversationId && isActiveConvError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Couldn't load this conversation
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                {getErrorMessage(activeConvError)}
              </p>
              <button
                onClick={() => refetchActiveConv()}
                className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-[#2D1F4D] flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-violet-500" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Your messages</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Select a conversation on the left or start a new one with the pencil icon.
              </p>
            </div>
          )}
        </div>

        {/* Details panel */}
        {showDetails && activeConv && (
          <div className="w-72 shrink-0 h-full">
            <ConversationDetailsPanel
              conversation={activeConv}
              currentUserId={user.id}
              onClose={closeDetails}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
