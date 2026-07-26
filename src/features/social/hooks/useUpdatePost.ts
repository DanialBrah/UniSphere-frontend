import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { postApi } from '../api/postApi'
import { socialKeys } from '../types'
import type { UpdatePostRequest } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useUpdatePost(postId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdatePostRequest) => postApi.updatePost(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.post(postId) })
      queryClient.invalidateQueries({ queryKey: socialKeys.feedInfinite() })
      toast.success('Post updated')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
