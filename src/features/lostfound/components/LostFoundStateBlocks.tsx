import type { LucideIcon } from 'lucide-react'
import { lostFoundErrorMessage } from '../utils/lostFoundErrors'

interface StateBlockProps {
  icon: LucideIcon
  title: string
  hint?: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'neutral' | 'error'
}

/**
 * The icon + heading + hint + optional action block every list state uses, mirroring
 * `NewsStateBlocks` so the two boards read as one product.
 */
export function LostFoundStateBlock({
  icon: Icon,
  title,
  hint,
  actionLabel,
  onAction,
  tone = 'neutral',
}: Readonly<StateBlockProps>) {
  const iconWrapper =
    tone === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-primary-50 dark:bg-primary/10'
  const iconColor = tone === 'error' ? 'text-red-500' : 'text-primary'

  return (
    <div className="py-16 text-center">
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${iconWrapper}`}
      >
        <Icon size={28} className={iconColor} />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      {hint && (
        <p className="mx-auto mb-5 max-w-md text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function LostFoundErrorState({
  icon,
  title,
  error,
  onRetry,
}: Readonly<{ icon: LucideIcon; title: string; error: unknown; onRetry: () => void }>) {
  return (
    <LostFoundStateBlock
      icon={icon}
      title={title}
      // The feature-specific mapper, not the generic one: a 429 from the claim endpoints and a 409
      // from a status transition both need copy the raw message doesn't supply.
      hint={lostFoundErrorMessage(error)}
      actionLabel="Retry"
      onAction={onRetry}
      tone="error"
    />
  )
}
