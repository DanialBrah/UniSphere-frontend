import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rss, Loader2, PenSquare } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { stagger } from '../../../lib/animations'
import { PostCard } from '../components/PostCard'
import { PostSkeleton } from '../components/PostSkeleton'
import { CreatePostModal } from '../components/CreatePostModal'
import { useFeed } from '../hooks/useFeed'

export default function FeedPage() {
  const { data, isLoading, isError, error, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useFeed()
  const [showCreate, setShowCreate] = useState(false)

  const posts = data?.pages.flatMap((p) => p.content) ?? []

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto w-full">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Feed</h1>

        {/* Create post prompt */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-3 bg-white dark:bg-[#1A1226] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] p-4 mb-6 text-left hover:border-primary/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-primary-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600/20 transition-colors">
            <PenSquare size={16} className="text-primary" />
          </div>
          <span className="text-sm text-gray-400 dark:text-gray-500 flex-1">
            What's on your mind?
          </span>
          <span className="text-xs font-semibold text-primary px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary-50 dark:hover:bg-primary/10 transition-colors">
            Post
          </span>
        </button>

        {/* Skeletons */}
        {isLoading && !data && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Rss size={28} className="text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Failed to load feed
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && posts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Rss size={28} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Nothing here yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Be the first to share something with your campus!
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Create post
            </button>
          </div>
        )}

        {/* Feed */}
        {posts.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </motion.div>
        )}

        {/* Load more */}
        {hasNextPage && (
          <div className="mt-6 text-center">
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

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </DashboardLayout>
  )
}
