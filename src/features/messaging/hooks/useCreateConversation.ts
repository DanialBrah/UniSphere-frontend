import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { conversationApi } from '../api/conversationApi'
import { messagingKeys } from './useConversations'
import type { CreateConversationRequest } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateConversationRequest) => conversationApi.createConversation(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
