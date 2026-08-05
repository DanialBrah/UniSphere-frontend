import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'
import type { CreatePostRequest } from '../../social/types'

export function useCreateCommunityPost(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreatePostRequest) => communityApi.createPost(communityId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.postsInfinite(communityId) })
      toast.success('Post created')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
