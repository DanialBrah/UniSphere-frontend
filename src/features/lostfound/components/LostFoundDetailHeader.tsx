import { Clock, KeyRound } from 'lucide-react'
import {
  ApproximateLocationBadge,
  LostFoundCategoryBadge,
  LostFoundStatusBadge,
  LostFoundTypeBadge,
} from './LostFoundBadges'
import { LostFoundImageFallback } from './LostFoundMediaGallery'
import { getInitials } from '../../../lib/userDisplay'
import { formatLostFoundDateTime, formatLostFoundRelative } from '../utils/dateUtils'
import { OCCURRED_AT_LABEL } from '../utils/display'
import type { LostFoundItemResponse } from '../types'

export function LostFoundDetailHeader({ item }: Readonly<{ item: LostFoundItemResponse }>) {
  return (
    <header className="space-y-4">
      {item.primaryImageUrl ? (
        <img
          // Presigned URL, ~60 min expiry. The detail query refetches on window focus so a tab
          // left open overnight re-mints it rather than rendering a broken image.
          src={item.primaryImageUrl}
          alt={item.title}
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
      ) : (
        <LostFoundImageFallback />
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <LostFoundTypeBadge type={item.itemType} />
        <LostFoundStatusBadge status={item.status} />
        <LostFoundCategoryBadge category={item.category} />
        {item.coordinatesApproximate && <ApproximateLocationBadge />}
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          <span title={formatLostFoundDateTime(item.occurredAt)}>
            {OCCURRED_AT_LABEL[item.itemType].replace('?', '').replace('When did you', 'You')}{' '}
            {formatLostFoundRelative(item.occurredAt)}
          </span>
        </p>
      </div>

      {item.description && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {item.description}
        </p>
      )}

      {/*
        Only ever non-null for the reporter and admins — the server withholds it from everyone
        else, including an approved claimant, because it is the question used to adjudicate.
      */}
      {item.identifyingDetail && (
        <div className="flex gap-2.5 rounded-xl border border-dashed border-primary/40 p-3">
          <KeyRound className="h-4 w-4 shrink-0 translate-y-px text-primary" />
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              Your private identifying detail
            </p>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              {item.identifyingDetail}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Only you can see this. Use it to check a claim.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
        {item.reporter.avatarUrl ? (
          <img
            src={item.reporter.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-[11px] font-semibold text-primary dark:bg-primary/20">
            {getInitials(item.reporter.displayName)}
          </div>
        )}
        <div className="text-xs">
          <p className="font-medium text-gray-900 dark:text-white">{item.reporter.displayName}</p>
          <p className="text-gray-500 dark:text-gray-400">
            Reported {formatLostFoundRelative(item.createdAt)}
          </p>
        </div>
      </div>
    </header>
  )
}
