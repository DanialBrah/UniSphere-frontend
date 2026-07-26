import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { conversationApi } from '../api/conversationApi'
import { messagingKeys } from './useConversations'
import { useChatStore } from '../../../stores/chatStore'
import { getErrorMessage } from '../../../lib/utils'

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  const { setActive, clearUnread } = useChatStore()

  return useMutation({
    mutationFn: (conversationId: number) => conversationApi.deleteConversation(conversationId),
    onSuccess: (_data, conversationId) => {
      clearUnread(conversationId)
      setActive(null)
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })
      queryClient.removeQueries({ queryKey: messagingKeys.conversation(conversationId) })
      queryClient.removeQueries({ queryKey: messagingKeys.messagesInfinite(conversationId) })
      toast.success('Conversation deleted')
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) toast.error('You don\'t have permission to delete this conversation')
      else toast.error(getErrorMessage(err))
    },
  })
}
