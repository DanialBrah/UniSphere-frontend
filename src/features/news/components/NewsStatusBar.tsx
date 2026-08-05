import { Archive, Send, Undo2 } from 'lucide-react'
import { useChangeNewsStatus } from '../hooks/useNewsMutations'
import { allowedTransitions, transitionLabel } from '../utils/statusMachine'
import { canPublish } from '../schemas'
import { StatusChip } from './NewsStatusBadge'
import { formatNewsDateTime, isScheduled } from '../utils/dateUtils'
import type { NewsArticleResponse, NewsStatus } from '../types'

const ICON: Record<NewsStatus, typeof Send> = {
  PUBLISHED: Send,
  DRAFT: Undo2,
  ARCHIVED: Archive,
}

/**
 * The editor's status strip. Its buttons come from the same allowedTransitions table the
 * article menu and the Studio use, so a rejected transition (and its 409) can't be reached.
 */
export function NewsStatusBar({ article }: { article: NewsArticleResponse }) {
  const changeStatus = useChangeNewsStatus(article.id)

  // Publish is offered by the toolbar for drafts; this strip carries the other directions.
  const transitions = allowedTransitions(article.status).filter(
    (to) => !(article.status === 'DRAFT' && to === 'PUBLISHED'),
  )
  const publishBlocked = !canPublish({ title: article.title, content: article.content ?? '' })

  return (
    <div className="flex items-center gap-3 flex-wrap px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D]">
      <StatusChip status={article.status} scheduledAt={article.scheduledAt} />

      <span className="text-xs text-gray-500 dark:text-gray-400">
        {isScheduled(article)
          ? `Publishes ${formatNewsDateTime(article.scheduledAt)}`
          : article.status === 'PUBLISHED'
            ? `Published ${formatNewsDateTime(article.publishedAt)}`
            : article.status === 'ARCHIVED'
              ? 'Hidden from the feed and search'
              : 'Not visible to readers yet'}
      </span>

      {transitions.length > 0 && (
        <div className="ml-auto flex items-center gap-2">
          {transitions.map((to) => {
            const Icon = ICON[to]
            const blocked = to === 'PUBLISHED' && publishBlocked
            return (
              <button
                key={to}
                type="button"
                onClick={() => changeStatus.mutate({ status: to })}
                disabled={blocked || changeStatus.isPending}
                title={blocked ? 'Add a title and content before publishing' : undefined}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2D1F4D] text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon size={13} />
                {transitionLabel(article.status, to)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
