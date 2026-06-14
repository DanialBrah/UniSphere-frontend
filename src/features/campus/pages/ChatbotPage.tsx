import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { ChatbotHeader } from '../components/ChatbotHeader'
import { ChatMessageArea } from '../components/ChatMessageArea'
import { ChatInput } from '../components/ChatInput'
import { useChatbot } from '../hooks/useChatbot'

export default function ChatbotPage() {
  const { messages, historyLoading, sendMessage, isPending, clearSession, isClearing } = useChatbot()

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col bg-white dark:bg-[#120D1E]">
        <ChatbotHeader
          hasMessages={messages.length > 0}
          isClearing={isClearing}
          onClear={clearSession}
        />
        <ChatMessageArea messages={messages} historyLoading={historyLoading} isPending={isPending} />
        <ChatInput onSend={(msg) => sendMessage(msg)} disabled={isPending} />
      </div>
    </DashboardLayout>
  )
}
