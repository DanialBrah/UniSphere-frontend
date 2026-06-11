import { Loader2, FileText } from 'lucide-react'
import { PostCard } from './PostCard'
import { PostSkeleton } from './PostSkeleton'
import { useUserPosts } from '../hooks/useUserPosts'

interface Props {
  userId: number
}

export function UserPostsFeed({ userId }: Props) {
  const { data, isLoading, isError, error, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useUserPosts(userId)

  const posts = data?.pages.flatMap((p) => p.content) ?? []

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D]">
        <FileText size={32} className="text-red-400 mb-3" />
        <p className="text-sm text-red-500 dark:text-red-400 mb-1">Failed to load posts</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm text-primary font-medium hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D]">
        <FileText size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No posts yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div className="text-center pt-2">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
            {isFetchingNextPage ? 'Loading…' : 'Load more posts'}
          </button>
        </div>
      )}
    </div>
  )
}
