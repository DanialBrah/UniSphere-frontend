import type { LucideIcon } from 'lucide-react'
import { getErrorMessage } from '../../../lib/utils'

/**
 * The icon-in-a-rounded-square + heading + hint + optional action block that every list state
 * uses. FeedPage inlines this shape three times; extracting it here keeps the News pages from
 * repeating it across the feed, search, saved, liked and five Studio tabs.
 */
interface StateBlockProps {
  icon: LucideIcon
  title: string
  hint?: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'neutral' | 'error'
}

export function NewsStateBlock({
  icon: Icon,
  title,
  hint,
  actionLabel,
  onAction,
  tone = 'neutral',
}: StateBlockProps) {
  const iconWrapper =
    tone === 'error'
      ? 'bg-red-50 dark:bg-red-900/20'
      : 'bg-primary-50 dark:bg-primary/10'
  const iconColor = tone === 'error' ? 'text-red-500' : 'text-primary'

  return (
    <div className="text-center py-16">
      <div
        className={`w-16 h-16 rounded-2xl ${iconWrapper} flex items-center justify-center mx-auto mb-4`}
      >
        <Icon size={28} className={iconColor} />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      {hint && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto">{hint}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function NewsErrorState({
  icon,
  title,
  error,
  onRetry,
}: {
  icon: LucideIcon
  title: string
  error: unknown
  onRetry: () => void
}) {
  return (
    <NewsStateBlock
      icon={icon}
      title={title}
      hint={getErrorMessage(error)}
      actionLabel="Retry"
      onAction={onRetry}
      tone="error"
    />
  )
}
