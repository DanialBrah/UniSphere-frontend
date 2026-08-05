import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useDeleteCommunityPost(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: number) => communityApi.deletePost(communityId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.postsInfinite(communityId) })
      toast.success('Post removed')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
