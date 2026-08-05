import { Star } from 'lucide-react'
import {
  CATEGORY_CHIP,
  CATEGORY_LABEL,
  SCHEDULED_CHIP,
  SCHEDULED_LABEL,
  STATUS_CHIP,
  STATUS_LABEL,
} from '../utils/display'
import { isScheduled } from '../utils/dateUtils'
import type { NewsCategory, NewsStatus } from '../types'

const CHIP_BASE = 'text-[10px] px-2 py-0.5 rounded-full font-semibold'

export function CategoryChip({ category }: { category: NewsCategory }) {
  return (
    <span className={`${CHIP_BASE} ${CATEGORY_CHIP[category]}`}>
      {CATEGORY_LABEL[category]}
    </span>
  )
}

/**
 * Renders "Scheduled" for a DRAFT that carries a scheduledAt. There is no SCHEDULED status in
 * the API — the scheduler flips such drafts to PUBLISHED — so the state only exists here.
 */
export function StatusChip({
  status,
  scheduledAt,
}: {
  status: NewsStatus
  scheduledAt?: string | null
}) {
  if (isScheduled({ status, scheduledAt })) {
    return <span className={`${CHIP_BASE} ${SCHEDULED_CHIP}`}>{SCHEDULED_LABEL}</span>
  }
  return <span className={`${CHIP_BASE} ${STATUS_CHIP[status]}`}>{STATUS_LABEL[status]}</span>
}

/** Read-only: no endpoint sets `featured`, so this is a badge and never a control. */
export function FeaturedBadge() {
  return (
    <span
      className={`${CHIP_BASE} inline-flex items-center gap-1 bg-primary-100 text-primary-700 dark:bg-primary/20 dark:text-primary-400`}
    >
      <Star size={10} className="fill-current" />
      Featured
    </span>
  )
}
