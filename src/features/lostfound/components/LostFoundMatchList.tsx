import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { LostFoundTypeBadge } from './LostFoundBadges'
import { useLostFoundMatches } from '../hooks/useLostFoundQueries'
import { formatLostFoundRelative } from '../utils/dateUtils'
import type { LostFoundItemResponse } from '../types'

/**
 * Suggested counterparts for the reporter's own item — a LOST report looks for FOUND ones and
 * vice versa.
 *
 * Reporter/ADMIN only; the endpoint 403s for anyone else, so `enabled` is gated on `canModify`
 * rather than the request being fired and the error swallowed.
 *
 * Renders nothing when there are no matches. A "no suggestions" block on every item would be
 * noise on the majority of pages, since scoring needs a category, a location or shared words to
 * work with.
 */
export function LostFoundMatchList({ item }: Readonly<{ item: LostFoundItemResponse }>) {
  const { data, isPending } = useLostFoundMatches(item.id, item.canModify)

  if (!item.canModify || isPending || !data || data.length === 0) return null

  return (
    <section className="rounded-2xl border border-primary/30 bg-primary-50/60 p-4 dark:border-primary/25 dark:bg-primary/10">
      <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        <Sparkles className="h-4 w-4 text-primary" />
        Possible matches
      </h2>
      <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
        {item.itemType === 'LOST'
          ? 'Found items reported around the same time and place.'
          : 'Lost items that look like they could be this one.'}
      </p>

      <div className="space-y-2">
        {data.map(({ item: match, score, reasons }) => (
          <Link
            key={match.id}
            to={`/lost-found/${match.id}`}
            className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226]"
          >
            {match.primaryImageUrl && (
              <img
                src={match.primaryImageUrl}
                alt=""
                loading="lazy"
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <LostFoundTypeBadge type={match.itemType} />
                {/* 0–100, weighted category 30 / geo 25 / text 25 / date 20 server-side. */}
                <span className="text-[11px] font-semibold text-primary">{score}% match</span>
              </div>
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {match.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {reasons.join(' · ')}
              </p>
              <p className="text-xs text-gray-400">
                {formatLostFoundRelative(match.occurredAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
