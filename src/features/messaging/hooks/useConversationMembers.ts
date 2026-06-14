import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { conversationApi } from '../api/conversationApi'
import { messagingKeys } from './useConversations'

export function useConversationMembers(conversationId: number | null) {
  return useQuery({
    queryKey: messagingKeys.conversationMembers(conversationId ?? 0),
    queryFn: () => conversationApi.getMembers(conversationId!),
    enabled: conversationId !== null,
    staleTime: 60 * 1000,
  })
}

export function usePromoteMember(conversationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => conversationApi.promoteMember(conversationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversationMembers(conversationId) })
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversation(conversationId) })
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })
      toast.success('Member promoted to admin')
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) toast.error('Only an admin can promote members')
      else if (status === 400) toast.error('User is already an admin or not in this group')
      else toast.error('Failed to promote member')
    },
  })
}

export function useRemoveMember(conversationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => conversationApi.removeMember(conversationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversationMembers(conversationId) })
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversation(conversationId) })
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversationsInfinite() })
      toast.success('Member removed')
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) toast.error('Only the group admin can remove members')
      else toast.error('Failed to remove member')
    },
  })
}
