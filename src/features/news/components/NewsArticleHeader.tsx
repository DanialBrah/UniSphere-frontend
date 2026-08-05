import { Link } from 'react-router-dom'
import { Archive, Eye, Lock } from 'lucide-react'
import { NewsAuthorLine } from './NewsAuthorLine'
import { NewsCoverImage } from './NewsCoverImage'
import { CategoryChip, FeaturedBadge, StatusChip } from './NewsStatusBadge'
import { formatNewsDate, formatNewsDateTime, isScheduled } from '../utils/dateUtils'
import type { NewsArticleResponse } from '../types'

export function NewsArticleHeader({ article }: { article: NewsArticleResponse }) {
  const scheduled = isScheduled(article)

  return (
    <header>
      {article.coverImageUrl && (
        <NewsCoverImage
          src={article.coverImageUrl}
          alt={article.title}
          aspect="21/9"
          className="rounded-2xl mb-5"
        />
      )}

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <CategoryChip category={article.category} />
        {article.featured && <FeaturedBadge />}
        {/* Published is the default state — only the exceptions are worth a chip here. */}
        {article.status !== 'PUBLISHED' && (
          <StatusChip status={article.status} scheduledAt={article.scheduledAt} />
        )}
        {article.visibility === 'UNIVERSITY' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <Lock size={10} />
            University only
          </span>
        )}
      </div>

      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
        {article.title}
      </h1>

      {article.summary && (
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
          {article.summary}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap pb-5 border-b border-gray-200 dark:border-[#2D1F4D]">
        <NewsAuthorLine author={article.author} timestamp={null} size="md" />
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {article.publishedAt && <span>{formatNewsDate(article.publishedAt)}</span>}
          <span className="flex items-center gap-1">
            <Eye size={13} />
            {article.viewsCount}
          </span>
        </div>
      </div>

      {/* Archived articles stay reachable by permalink but are excluded from the feed, search
          and tag listings, and comments are closed on them. Without this notice both of those
          read as bugs to the person who followed the link. */}
      {article.status === 'ARCHIVED' && (
        <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-900/30">
          <Archive size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            This article has been archived. It&rsquo;s no longer listed in the feed, and comments
            are closed.
          </p>
        </div>
      )}

      {scheduled && (
        <div className="mt-5 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-900/30">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Scheduled to publish {formatNewsDateTime(article.scheduledAt)}.
          </p>
        </div>
      )}

      {article.tags.length > 0 && (
        <div className="mt-5 flex items-center gap-1.5 flex-wrap">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              to={`/news?tag=${encodeURIComponent(tag)}`}
              className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
