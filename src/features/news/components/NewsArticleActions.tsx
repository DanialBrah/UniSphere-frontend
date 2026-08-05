import { Bookmark, Eye, Heart, MessageCircle, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useToggleNewsLike } from '../hooks/useToggleNewsLike'
import { useToggleNewsSave } from '../hooks/useToggleNewsSave'
import type { NewsArticleLike } from '../types'

interface Props {
  article: NewsArticleLike
  onCommentClick?: () => void
  /** Detail view adds the view count and a share button; cards stay compact. */
  showShare?: boolean
  showViews?: boolean
}

async function shareArticle(title: string) {
  const url = window.location.href

  if (navigator.share) {
    try {
      await navigator.share({ title, url })
      return
    } catch (err) {
      // Dismissing the native share sheet rejects with AbortError. That's the user declining,
      // not a failure — surfacing a toast for it would be noise.
      if (err instanceof Error && err.name === 'AbortError') return
    }
  }

  // navigator.clipboard is undefined on non-secure origins, so this can't be assumed either.
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
      return
    } catch {
      /* falls through to the manual prompt below */
    }
  }

  toast.info(url, { description: 'Copy this link to share the article.', duration: 10000 })
}

export function NewsArticleActions({
  article,
  onCommentClick,
  showShare = false,
  showViews = false,
}: Props) {
  const toggleLike = useToggleNewsLike()
  const toggleSave = useToggleNewsSave()

  return (
    <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-[#2D1F4D]">
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => toggleLike.mutate(article.id)}
        disabled={toggleLike.isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-60"
        aria-label={article.liked ? 'Unlike article' : 'Like article'}
      >
        <Heart
          size={17}
          className={article.liked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}
          fill={article.liked ? 'currentColor' : 'none'}
        />
        <span className={article.liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
          {article.likesCount > 0 ? article.likesCount : ''}
        </span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onCommentClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        aria-label="View comments"
      >
        <MessageCircle size={17} className="text-gray-400 dark:text-gray-500" />
        <span>{article.commentCount > 0 ? article.commentCount : ''}</span>
      </motion.button>

      {showViews && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Eye size={17} className="text-gray-400 dark:text-gray-500" />
          {article.viewsCount}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1">
        {showShare && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => shareArticle(article.title)}
            className="flex items-center px-3 py-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary transition-colors"
            aria-label="Share article"
          >
            <Share2 size={17} />
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => toggleSave.mutate(article.id)}
          disabled={toggleSave.isPending}
          className="flex items-center px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-60"
          aria-label={article.saved ? 'Unsave article' : 'Save article'}
        >
          <Bookmark
            size={17}
            className={article.saved ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}
            fill={article.saved ? 'currentColor' : 'none'}
          />
        </motion.button>
      </div>
    </div>
  )
}
