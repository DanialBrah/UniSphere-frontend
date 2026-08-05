import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'
import type { BanRequest } from '../types'

export function useBanMember(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, ...body }: { userId: number } & BanRequest) =>
      communityApi.banMember(communityId, userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.bansInfinite(communityId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.membersInfinite(communityId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) })
      toast.success('Member banned')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
