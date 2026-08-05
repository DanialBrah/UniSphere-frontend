import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp } from '../../../lib/animations'
import { NewsAuthorLine } from './NewsAuthorLine'
import { NewsCoverImage } from './NewsCoverImage'
import { NewsArticleActions } from './NewsArticleActions'
import { CategoryChip, FeaturedBadge, StatusChip } from './NewsStatusBadge'
import type { NewsArticleLike } from '../types'

const MAX_VISIBLE_TAGS = 4

interface Props {
  article: NewsArticleLike
  /**
   * Off by default: the feed and search only ever return PUBLISHED articles, so a status chip
   * there is noise. The Studio turns it on, where drafts and archives actually appear.
   */
  showStatus?: boolean
  /** Studio cards carry their own transition controls under the summary. */
  footer?: React.ReactNode
}

// Summaries have no scheduledAt, so the derived "Scheduled" chip only appears where the caller
// passes a full article through (the Studio patches it in from the detail payload if needed).
type MaybeScheduled = NewsArticleLike & { scheduledAt?: string | null }

export function NewsCard({ article, showStatus = false, footer }: Props) {
  const navigate = useNavigate()
  const scheduledAt = (article as MaybeScheduled).scheduledAt ?? null

  const visibleTags = article.tags.slice(0, MAX_VISIBLE_TAGS)
  const hiddenTagCount = article.tags.length - visibleTags.length

  return (
    <motion.article
      variants={fadeUp}
      className="bg-white dark:bg-[#1A1226] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] overflow-hidden"
    >
      <Link to={`/news/${article.id}`} className="block group">
        <NewsCoverImage src={article.coverImageUrl} alt={article.title} />
      </Link>

      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          <CategoryChip category={article.category} />
          {article.featured && <FeaturedBadge />}
          {showStatus && <StatusChip status={article.status} scheduledAt={scheduledAt} />}
        </div>

        <Link to={`/news/${article.id}`} className="block group">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>

        {article.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3.5">
            {article.summary}
          </p>
        )}

        {visibleTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
            {visibleTags.map((tag) => (
              <Link
                key={tag}
                to={`/news?tag=${encodeURIComponent(tag)}`}
                className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                #{tag}
              </Link>
            ))}
            {hiddenTagCount > 0 && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                +{hiddenTagCount}
              </span>
            )}
          </div>
        )}

        {/* publishedAt is null on drafts, so fall back to createdAt or the line renders empty. */}
        <NewsAuthorLine
          author={article.author}
          timestamp={article.publishedAt ?? article.createdAt}
        />

        <NewsArticleActions
          article={article}
          onCommentClick={() => navigate(`/news/${article.id}`)}
        />

        {footer}
      </div>
    </motion.article>
  )
}
