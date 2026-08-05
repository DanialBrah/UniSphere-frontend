import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useApproveJoinRequest(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: number) => communityApi.approveJoinRequest(communityId, requestId),
    onSuccess: () => {
      // Matches every status-filtered variant of the join-requests key for this community
      queryClient.invalidateQueries({
        queryKey: ['communities', communityId, 'join-requests'],
        exact: false,
      })
      queryClient.invalidateQueries({ queryKey: communityKeys.membersInfinite(communityId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) })
      toast.success('Join request approved')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
