import { Lock, MessageSquare } from 'lucide-react'
import { MessageList } from '../../messaging/components/MessageList'
import { MessageInput } from '../../messaging/components/MessageInput'
import { useSendMessage } from '../../messaging/hooks/useSendMessage'
import { useCommunityChatAccess } from '../hooks/useCommunityChatAccess'
import { useAuth } from '../../../hooks/useAuth'
import type { CommunityMemberRole } from '../types'

interface Props {
  communityId: number
  viewerRole: CommunityMemberRole | null
}

export function CommunityChatTab({ communityId, viewerRole }: Props) {
  const { user } = useAuth()
  const isMember = viewerRole != null
  const { data, isLoading } = useCommunityChatAccess(communityId, isMember)
  const { mutate: sendMessage } = useSendMessage()

  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1E1430] flex items-center justify-center">
          <Lock size={22} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Join to access chat</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
          Only members can see and send messages in this community's chat.
        </p>
      </div>
    )
  }

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <MessageSquare size={22} className="text-gray-300 dark:text-gray-600 animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm text-red-500 dark:text-red-400">Couldn't load chat</p>
      </div>
    )
  }

  const conversationId = data.conversationId

  return (
    <div className="flex flex-col h-[calc(100vh-320px)] min-h-[360px]">
      <MessageList conversationId={conversationId} currentUserId={user.id} />
      <MessageInput
        conversationId={conversationId}
        onSend={(content) => sendMessage({ conversationId, content, msgType: 'TEXT' })}
      />
    </div>
  )
}
