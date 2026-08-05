import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'
import type { CommunityMemberRole } from '../types'

export function useChangeMemberRole(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: CommunityMemberRole }) =>
      communityApi.changeRole(communityId, userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.membersInfinite(communityId) })
      queryClient.invalidateQueries({ queryKey: communityKeys.detail(communityId) })
      toast.success('Role updated')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
