import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, Loader2, PenSquare } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useAuth } from '../../../hooks/useAuth'
import { NewsEditorForm } from '../components/NewsEditorForm'
import { useNewsArticle } from '../hooks/useNewsQueries'
import { canAuthorNews, canModifyArticle } from '../utils/permissions'
import { newsErrorMessage } from '../utils/newsErrors'

function Notice({
  title,
  body,
  actionLabel,
  actionTo,
}: {
  title: string
  body: string
  actionLabel: string
  actionTo: string
}) {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-xl mx-auto w-full text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <PenSquare size={28} className="text-primary" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{body}</p>
        <Link
          to={actionTo}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          {actionLabel}
        </Link>
      </div>
    </DashboardLayout>
  )
}

/**
 * Resolves the article (if any) and gates on role, then hands a fully-loaded article to the
 * form. The `key` is what lets NewsEditorForm initialise all its state from props instead of
 * syncing it in an effect — a new id remounts the form with fresh defaults.
 */
export default function NewsEditorPage() {
  const { id } = useParams<{ id?: string }>()
  const { user } = useAuth()

  const articleId = Number(id)
  const isEdit = id != null && Number.isFinite(articleId) && articleId > 0

  const { data: article, isLoading, isError, error } = useNewsArticle(articleId, {
    enabled: isEdit,
  })

  // Mirrors NewsAccessService — the API rejects these independently, this just avoids
  // presenting a form whose every submission would 403.
  if (!canAuthorNews(user)) {
    return (
      <Notice
        title="Writing news isn't available on this account"
        body="Campus News is published by university, club, employer and admin accounts. You can still read, save and comment on every article."
        actionLabel="Browse news"
        actionTo="/news"
      />
    )
  }

  if (isEdit && isError) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-xl mx-auto w-full text-center py-20">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Couldn&rsquo;t open this article
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {newsErrorMessage(error)}
          </p>
          <Link
            to="/news/studio"
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Back to your articles
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  if (isEdit && isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 size={22} className="animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (isEdit && article && !canModifyArticle(user, article)) {
    return (
      <Notice
        title="You can't edit this article"
        body="Only its author, or an admin, can make changes."
        actionLabel="Read the article"
        actionTo={`/news/${articleId}`}
      />
    )
  }

  return (
    <DashboardLayout>
      <NewsEditorForm key={article?.id ?? 'new'} article={article ?? null} />
    </DashboardLayout>
  )
}
