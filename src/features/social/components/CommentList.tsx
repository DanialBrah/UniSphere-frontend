import { Loader2 } from 'lucide-react'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { useComments } from '../hooks/useComments'

interface Props {
  postId: number
}

export function CommentList({ postId }: Props) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useComments(postId)

  const comments = data?.pages.flatMap((p) => p.content) ?? []

  return (
    <div>
      <CommentForm postId={postId} />

      {isLoading && !data && (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-primary" />
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
          No comments yet. Be the first!
        </p>
      )}

      <div className="space-y-4 mt-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-4 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 text-sm text-primary font-medium hover:underline disabled:opacity-50 flex items-center gap-1.5 mx-auto"
          >
            {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
            Load more comments
          </button>
        </div>
      )}
    </div>
  )
}
