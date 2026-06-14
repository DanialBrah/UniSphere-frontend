import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { conversationApi } from '../api/conversationApi'
import { messagingKeys } from './useConversations'

export function useAddMember(conversationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => conversationApi.addMember(conversationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversation(conversationId) })
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })
      toast.success('Member added')
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) toast.error('Only the group admin can add members')
      else if (status === 409) toast.error('User is already in this group')
      else toast.error('Failed to add member')
    },
  })
}
