import { Heart, MessageCircle, Bookmark } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PostResponse } from '../types'
import { useToggleLike } from '../hooks/useToggleLike'
import { useToggleSave } from '../hooks/useToggleSave'

interface Props {
  post: PostResponse
  onCommentClick?: () => void
}

export function PostActions({ post, onCommentClick }: Props) {
  const toggleLike = useToggleLike()
  const toggleSave = useToggleSave()

  return (
    <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-[#2D1F4D]">
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => toggleLike.mutate(post.id)}
        disabled={toggleLike.isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-60"
        aria-label={post.liked ? 'Unlike post' : 'Like post'}
      >
        <Heart
          size={17}
          className={post.liked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}
          fill={post.liked ? 'currentColor' : 'none'}
        />
        <span className={post.liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
          {post.likesCount > 0 ? post.likesCount : ''}
        </span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onCommentClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        aria-label="View comments"
      >
        <MessageCircle size={17} className="text-gray-400 dark:text-gray-500" />
        <span>{post.commentCount > 0 ? post.commentCount : ''}</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => toggleSave.mutate(post.id)}
        disabled={toggleSave.isPending}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-60"
        aria-label={post.saved ? 'Unsave post' : 'Save post'}
      >
        <Bookmark
          size={17}
          className={post.saved ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}
          fill={post.saved ? 'currentColor' : 'none'}
        />
      </motion.button>
    </div>
  )
}
