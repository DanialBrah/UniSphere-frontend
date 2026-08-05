import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'
import type { CreateJoinRequestRequest } from '../types'

export function useRequestToJoin(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateJoinRequestRequest) =>
      communityApi.createJoinRequest(communityId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) })
      // Flips hasPendingJoinRequest on the Discover/search cards too, same reasoning as join/leave.
      queryClient.invalidateQueries({ queryKey: communityKeys.discoverInfinite() })
      queryClient.invalidateQueries({ queryKey: ['communities', 'search'], exact: false })
      toast.success('Join request submitted')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
