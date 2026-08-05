import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Pencil } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useAuth } from '../../../hooks/useAuth'
import { MarkdownContent } from '../components/MarkdownContent'
import { NewsArticleActions } from '../components/NewsArticleActions'
import { NewsArticleHeader } from '../components/NewsArticleHeader'
import { NewsArticleMenu } from '../components/NewsArticleMenu'
import { NewsCommentList } from '../components/NewsCommentList'
import { NewsMediaGallery } from '../components/NewsMediaGallery'
import { NewsSkeleton } from '../components/NewsSkeleton'
import { useNewsArticle } from '../hooks/useNewsQueries'
import { useGoBack } from '../hooks/useGoBack'
import { canModifyArticle } from '../utils/permissions'
import { newsErrorMessage } from '../utils/newsErrors'

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const commentsRef = useRef<HTMLDivElement>(null)

  // Falls back to the feed when this page was opened directly, so Back never leaves the app.
  const goBack = useGoBack('/news')

  const articleId = Number(id)
  // Guards against /news/abc firing a request that can only fail.
  const isValidId = id != null && Number.isFinite(articleId) && articleId > 0

  const { data: article, isLoading, isError, error } = useNewsArticle(articleId, {
    enabled: isValidId,
  })

  const canEdit = article ? canModifyArticle(user, article) : false

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-5"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {isLoading && isValidId && <NewsSkeleton />}

        {(!isValidId || isError) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle size={32} className="text-red-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Article not available
            </h3>
            {/* The API answers 404 for both "gone" and "not yours" so that a 403 can't be used
                to confirm an article exists. Naming permissions here would give that away. */}
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {isValidId
                ? newsErrorMessage(error)
                : "This article doesn't exist, or it isn't available to you."}
            </p>
            <Link
              to="/news"
              className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Back to news
            </Link>
          </div>
        )}

        {article && (
          <>
            {canEdit && (
              <div className="flex items-center justify-end gap-2 mb-4">
                <Link
                  to={`/news/editor/${article.id}`}
                  // Tells the editor this article is the entry directly behind it, so saving
                  // can step back onto it rather than pushing a duplicate.
                  state={{ fromArticle: true }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </Link>
                <NewsArticleMenu article={article} />
              </div>
            )}

            <article className="bg-white dark:bg-[#1A1226] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] p-6 lg:p-8">
              <NewsArticleHeader article={article} />

              <div className="mt-6">
                <MarkdownContent content={article.content ?? ''} />
              </div>

              <NewsMediaGallery media={article.media} />

              <NewsArticleActions
                article={article}
                showShare
                showViews
                onCommentClick={() =>
                  commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              />
            </article>

            <div ref={commentsRef} className="mt-6 scroll-mt-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Comments
              </h2>
              <NewsCommentList article={article} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
