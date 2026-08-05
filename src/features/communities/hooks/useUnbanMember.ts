import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useUnbanMember(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => communityApi.unbanMember(communityId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.bansInfinite(communityId) })
      toast.success('Member unbanned')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
