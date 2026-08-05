import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Loader2, Plus, Rss } from 'lucide-react'
import { PostCard } from '../../social/components/PostCard'
import { PostSkeleton } from '../../social/components/PostSkeleton'
import { CreateCommunityPostModal } from './CreateCommunityPostModal'
import { JoinToViewNotice } from './JoinToViewNotice'
import { useCommunityPosts } from '../hooks/useCommunityPosts'
import { getErrorMessage } from '../../../lib/utils'
import { isAccessDeniedError } from '../utils/accessError'
import { stagger } from '../../../lib/animations'
import type { CommunityMemberRole } from '../types'

interface Props {
  communityId: number
  viewerRole: CommunityMemberRole | null
}

export function CommunityPostsTab({ communityId, viewerRole }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading, isError, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useCommunityPosts(communityId)

  const posts = data?.pages.flatMap((p) => p.content) ?? []
  const isAccessDenied = isError && isAccessDeniedError(error, viewerRole)

  if (isAccessDenied) {
    return (
      <div className="py-5">
        <JoinToViewNotice icon={Rss} label="posts" />
      </div>
    )
  }

  return (
    <div className="py-5 space-y-4">
      {viewerRole != null && (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-[#2D1F4D] text-sm text-gray-500 dark:text-gray-400 hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Plus size={16} />
          Create post
        </button>
      )}

      {isLoading && (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-sm text-red-500 dark:text-red-400">Couldn't load posts</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{getErrorMessage(error)}</p>
          <button onClick={() => refetch()} className="text-xs text-primary font-medium hover:underline mt-1">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1E1430] flex items-center justify-center">
            <Rss size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No posts yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
            {viewerRole != null ? 'Be the first to post something.' : 'Join to be the first to post.'}
          </p>
        </div>
      )}

      {posts.length > 0 && (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          {posts.map((post) =>
            // Public/university-visible community feeds show posts to non-members, but the
            // backend's single-post gate (canViewPost) always requires membership — clicking
            // into, liking, or saving one of these would just fail as "post not found" with
            // no way for us to tell that apart from a genuinely missing post. Since we know
            // right here whether the viewer is a member, intercept the click and say why
            // instead of letting it hit the backend and come back as a confusing error.
            viewerRole == null ? (
              <div
                key={post.id}
                onClickCapture={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toast.info('Join this community to like, comment, or view this post')
                }}
              >
                <PostCard post={post} />
              </div>
            ) : (
              <PostCard key={post.id} post={post} />
            ),
          )}
        </motion.div>
      )}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-primary/40 hover:text-primary disabled:opacity-50 transition-colors"
          >
            {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {showCreate && (
        <CreateCommunityPostModal communityId={communityId} onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}
