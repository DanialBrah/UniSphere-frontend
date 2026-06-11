import { useState } from 'react'
import { Grid3x3, Heart, Bookmark, Loader2, FileText } from 'lucide-react'
import { UserPostsFeed } from './UserPostsFeed'
import { PostCard } from './PostCard'
import { PostSkeleton } from './PostSkeleton'
import { useLikedPosts } from '../hooks/useLikedPosts'
import { useSavedPosts } from '../hooks/useSavedPosts'

type Tab = 'posts' | 'liked' | 'saved'

const TABS: { id: Tab; label: string; icon: typeof Grid3x3 }[] = [
  { id: 'posts', label: 'Posts',  icon: Grid3x3  },
  { id: 'liked', label: 'Liked',  icon: Heart    },
  { id: 'saved', label: 'Saved',  icon: Bookmark },
]

function LikedPostsFeed() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useLikedPosts()
  const posts = data?.pages.flatMap((p) => p.content) ?? []

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
      </div>
    )
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D]">
        <Heart size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No liked posts yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => <PostCard key={post.id} post={post} />)}
      {hasNextPage && (
        <div className="text-center pt-2">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}

function SavedPostsFeed() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useSavedPosts()
  const posts = data?.pages.flatMap((p) => p.content) ?? []

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
      </div>
    )
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D]">
        <FileText size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No saved posts yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => <PostCard key={post.id} post={post} />)}
      {hasNextPage && (
        <div className="text-center pt-2">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}

interface Props {
  userId: number
}

export function ProfilePostsTabs({ userId }: Props) {
  const [active, setActive] = useState<Tab>('posts')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-[#2D1F4D] mb-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={[
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
              ].join(' ')}
            >
              <Icon size={15} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {active === 'posts' && <UserPostsFeed userId={userId} />}
      {active === 'liked' && <LikedPostsFeed />}
      {active === 'saved' && <SavedPostsFeed />}
    </div>
  )
}
