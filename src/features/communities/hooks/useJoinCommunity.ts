import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useJoinCommunity(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => communityApi.joinSelf(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.mineInfinite() })
      queryClient.invalidateQueries({ queryKey: communityKeys.membersInfinite(communityId) })
      // The Discover/search cards cache viewerRole too — without this they keep showing
      // "Join" after a successful join until something else happens to refetch them.
      queryClient.invalidateQueries({ queryKey: communityKeys.discoverInfinite() })
      queryClient.invalidateQueries({ queryKey: ['communities', 'search'], exact: false })
      toast.success('Joined community')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
