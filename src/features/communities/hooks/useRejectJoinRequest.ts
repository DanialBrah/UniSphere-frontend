import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { getErrorMessage } from '../../../lib/utils'

export function useRejectJoinRequest(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number) => communityApi.rejectJoinRequest(communityId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['communities', communityId, 'join-requests'],
        exact: false,
      })
      toast.success('Join request rejected')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
