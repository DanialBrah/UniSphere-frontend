import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { ChatbotHeader } from '../components/ChatbotHeader'
import { ChatMessageArea } from '../components/ChatMessageArea'
import { ChatInput } from '../components/ChatInput'
import { useChatbot } from '../hooks/useChatbot'
import { useCooldown } from '../../../hooks/useCooldown'

export default function ChatbotPage() {
  const {
    messages, historyLoading, isHistoryError, historyError, refetchHistory,
    sendMessage, isPending, sendError, clearSession, isClearing,
  } = useChatbot()
  const cooldown = useCooldown(sendError)

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col bg-white dark:bg-[#120D1E]">
        <ChatbotHeader
          hasMessages={messages.length > 0}
          isClearing={isClearing}
          onClear={clearSession}
        />
        <ChatMessageArea
          messages={messages}
          historyLoading={historyLoading}
          isPending={isPending}
          isHistoryError={isHistoryError}
          historyError={historyError}
          onRetryHistory={() => refetchHistory()}
        />
        <ChatInput onSend={(msg) => sendMessage(msg)} disabled={isPending || cooldown > 0} />
      </div>
    </DashboardLayout>
  )
}
