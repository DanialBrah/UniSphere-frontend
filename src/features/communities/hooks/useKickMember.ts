import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useKickMember(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => communityApi.kickMember(communityId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.membersInfinite(communityId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) })
      toast.success('Member removed')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
