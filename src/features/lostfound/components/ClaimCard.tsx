import { Link } from 'react-router-dom'
import { Quote } from 'lucide-react'
import { LostFoundClaimStatusBadge } from './LostFoundBadges'
import { getInitials } from '../../../lib/userDisplay'
import { formatLostFoundRelative } from '../utils/dateUtils'
import type { LostFoundClaimResponse } from '../types'

interface ClaimCardProps {
  claim: LostFoundClaimResponse
  /** Rendered by the reporter's view: approve / decline buttons. */
  actions?: React.ReactNode
  /** My Claims links through to the item; the item's own claim list already is the item. */
  showItemLink?: boolean
}

export function ClaimCard({ claim, actions, showItemLink = false }: Readonly<ClaimCardProps>) {
  return (
    <article className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <div className="flex items-start gap-3">
        {claim.claimant.avatarUrl ? (
          <img
            src={claim.claimant.avatarUrl}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary dark:bg-primary/20">
            {getInitials(claim.claimant.displayName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {claim.claimant.displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Claimed {formatLostFoundRelative(claim.createdAt)}
          </p>
        </div>

        <LostFoundClaimStatusBadge status={claim.status} />
      </div>

      {showItemLink && (
        <Link
          to={`/lost-found/${claim.itemId}`}
          className="block truncate text-sm font-medium text-primary hover:underline"
        >
          {claim.itemTitle}
        </Link>
      )}

      <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
        <p className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Quote className="h-3.5 w-3.5 shrink-0 translate-y-1 text-gray-400" />
          <span className="whitespace-pre-wrap break-words">{claim.proofText}</span>
        </p>
      </div>

      {claim.proofImageUrl && (
        <a href={claim.proofImageUrl} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={claim.proofImageUrl}
            alt="Proof of ownership"
            loading="lazy"
            className="max-h-48 w-full rounded-xl object-cover"
          />
        </a>
      )}

      {claim.decisionNote && (
        <p className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 dark:border-[#2D1F4D] dark:text-gray-400">
          <span className="font-semibold">Reporter&apos;s note: </span>
          {claim.decisionNote}
        </p>
      )}

      {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
    </article>
  )
}
