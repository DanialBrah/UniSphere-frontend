import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'
import type { UpdateCommunityRequest } from '../types'

export function useUpdateCommunity(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateCommunityRequest) => communityApi.update(communityId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.discoverInfinite() })
      queryClient.invalidateQueries({ queryKey: communityKeys.mineInfinite() })
      toast.success('Community updated')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
