import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HandHeart, TriangleAlert } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { ClaimCard } from './ClaimCard'
import { LostFoundClaimSkeleton } from './LostFoundSkeleton'
import { LostFoundErrorState, LostFoundStateBlock } from './LostFoundStateBlocks'
import { useMyClaims } from '../hooks/useLostFoundClaims'
import { CLAIM_STATUS_LABEL, CLAIM_STATUS_ORDER } from '../utils/display'
import type { LostFoundClaimResponse, LostFoundClaimStatus, SpringPage } from '../types'

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap'
const CHIP_ACTIVE = 'bg-primary text-white border-primary'
const CHIP_IDLE =
  'bg-white dark:bg-[#1A1226] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary'

const flatten = (
  data?: InfiniteData<SpringPage<LostFoundClaimResponse>>,
): LostFoundClaimResponse[] => data?.pages.flatMap((page) => page.content) ?? []

/**
 * The "My claims" tab — every claim the caller has submitted, across all items.
 *
 * Withdrawing happens on the item's own page rather than here: cancelling a claim without seeing
 * what you're cancelling is a mistake waiting to happen, and the card already links through.
 */
export function MyClaimsList() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<LostFoundClaimStatus | null>(null)
  const query = useMyClaims(status)

  const claims = flatten(query.data)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatus(null)}
          className={`${CHIP_BASE} ${status === null ? CHIP_ACTIVE : CHIP_IDLE}`}
        >
          All
        </button>
        {CLAIM_STATUS_ORDER.map((value) => {
          const active = status === value
          return (
            <button
              key={value}
              onClick={() => setStatus(active ? null : value)}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {CLAIM_STATUS_LABEL[value]}
            </button>
          )
        })}
      </div>

      {renderBody()}
    </div>
  )

  function renderBody() {
    if (query.isPending && query.fetchStatus !== 'idle') {
      return (
        <div className="space-y-3">
          <LostFoundClaimSkeleton />
          <LostFoundClaimSkeleton />
        </div>
      )
    }

    if (query.isError) {
      return (
        <LostFoundErrorState
          icon={TriangleAlert}
          title="Couldn't load your claims"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )
    }

    if (claims.length === 0) {
      return (
        <LostFoundStateBlock
          icon={HandHeart}
          title={status ? `No ${CLAIM_STATUS_LABEL[status].toLowerCase()} claims` : 'No claims yet'}
          hint="When you claim an item someone else reported, it shows up here with its status."
          actionLabel="Browse items"
          onAction={() => navigate('/lost-found')}
        />
      )
    }

    return (
      <>
        <div className="space-y-3">
          {claims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} showItemLink />
          ))}
        </div>

        {query.hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
            >
              {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </>
    )
  }
}
