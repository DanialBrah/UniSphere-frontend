import { useQuery } from '@tanstack/react-query'
import { commentApi } from '../api/commentApi'
import { socialKeys } from '../types'

export function useCommentReplies(postId: number, commentId: number, enabled: boolean) {
  return useQuery({
    queryKey: socialKeys.commentReplies(postId, commentId),
    queryFn: () => commentApi.getReplies(postId, commentId, 0, 50),
    enabled: enabled && postId > 0 && commentId > 0,
    select: (page) => page.content,
  })
}
