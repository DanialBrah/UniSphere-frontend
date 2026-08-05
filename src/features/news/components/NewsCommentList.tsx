import { Loader2, MessageSquareOff } from 'lucide-react'
import { NewsCommentItem } from './NewsCommentItem'
import { NewsCommentForm } from './NewsCommentForm'
import { useNewsComments } from '../hooks/useNewsComments'
import { canCommentOn } from '../utils/permissions'
import { getErrorMessage } from '../../../lib/utils'
import type { NewsArticleResponse } from '../types'

interface Props {
  /** Takes the whole article, not just an id — whether commenting is open depends on status. */
  article: NewsArticleResponse
}

export function NewsCommentList({ article }: Props) {
  const { data, isLoading, isError, error, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useNewsComments(article.id)

  const comments = data?.pages.flatMap((p) => p.content) ?? []

  // The server rejects comment creation on anything that isn't PUBLISHED, so the form has to
  // disappear rather than fail. Reading still works on every article the viewer can see.
  const commentsOpen = canCommentOn(article)

  return (
    <div>
      {commentsOpen ? (
        <NewsCommentForm articleId={article.id} />
      ) : (
        <div className="flex items-center gap-2.5 px-4 py-3 mb-4 rounded-xl bg-gray-50 dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D]">
          <MessageSquareOff size={16} className="text-gray-400 shrink-0" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {article.status === 'DRAFT'
              ? 'Comments open once this article is published.'
              : 'This article is archived — comments are closed.'}
          </p>
        </div>
      )}

      {isLoading && !data && (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="text-center py-6">
          <p className="text-sm text-red-500 dark:text-red-400 mb-2">Failed to load comments</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{getErrorMessage(error)}</p>
        </div>
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
          {commentsOpen ? 'No comments yet. Be the first!' : 'No comments on this article.'}
        </p>
      )}

      <div className="space-y-4 mt-4">
        {comments.map((comment) => (
          <NewsCommentItem key={comment.id} comment={comment} canReply={commentsOpen} />
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
