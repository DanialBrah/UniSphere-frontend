import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useLeaveCommunity(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => communityApi.leave(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.mineInfinite() })
      queryClient.invalidateQueries({ queryKey: communityKeys.membersInfinite(communityId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.discoverInfinite() })
      queryClient.invalidateQueries({ queryKey: ['communities', 'search'], exact: false })
      toast.success('Left community')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
