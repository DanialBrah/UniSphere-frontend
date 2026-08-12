import { useState } from 'react'
import { Check, Inbox, TriangleAlert, X } from 'lucide-react'
import type { InfiniteData } from '@tanstack/react-query'
import { ClaimCard } from './ClaimCard'
import { ClaimDecisionModal } from './ClaimDecisionModal'
import { LostFoundClaimSkeleton } from './LostFoundSkeleton'
import { LostFoundErrorState, LostFoundStateBlock } from './LostFoundStateBlocks'
import { useItemClaims } from '../hooks/useLostFoundClaims'
import { canCancelClaim, canDecideClaim } from '../utils/permissions'
import { useAuth } from '../../../hooks/useAuth'
import type { LostFoundClaimResponse, LostFoundItemResponse, SpringPage } from '../types'

type Decision = 'APPROVED' | 'REJECTED' | 'CANCELLED'

const flatten = (
  data?: InfiniteData<SpringPage<LostFoundClaimResponse>>,
): LostFoundClaimResponse[] => data?.pages.flatMap((page) => page.content) ?? []

const SMALL_BUTTON =
  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors'

/**
 * Claims on one item.
 *
 * Only mounted when the viewer can actually see claims — the reporter, an admin, or someone who
 * has claimed it themselves. Everyone else gets a 403 from this endpoint, and the endpoint is
 * rate-limited to 10 requests a minute including GETs, so it must never be fetched speculatively.
 */
export function ItemClaimList({ item }: Readonly<{ item: LostFoundItemResponse }>) {
  const { user } = useAuth()
  const [pending, setPending] = useState<{ claim: LostFoundClaimResponse; decision: Decision } | null>(
    null,
  )

  const query = useItemClaims(item.id, null, true)
  const claims = flatten(query.data)
  const pendingCount = claims.filter((claim) => claim.status === 'PENDING').length

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        Claims{claims.length > 0 && <span className="text-gray-400"> · {claims.length}</span>}
      </h2>

      {renderBody()}

      {pending && (
        <ClaimDecisionModal
          claim={pending.claim}
          decision={pending.decision}
          itemId={item.id}
          // The approved claim itself is excluded — only the others get auto-rejected.
          siblingPendingCount={Math.max(0, pendingCount - 1)}
          onClose={() => setPending(null)}
        />
      )}
    </section>
  )

  function renderBody() {
    if (query.isPending && query.fetchStatus !== 'idle') return <LostFoundClaimSkeleton />

    if (query.isError) {
      return (
        <LostFoundErrorState
          icon={TriangleAlert}
          title="Couldn't load claims"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )
    }

    if (claims.length === 0) {
      return (
        <LostFoundStateBlock
          icon={Inbox}
          title="No claims yet"
          hint={
            item.canModify
              ? "You'll be notified as soon as someone claims this item."
              : 'Nobody has claimed this item yet.'
          }
        />
      )
    }

    return (
      <>
        <div className="space-y-3">
          {claims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              actions={renderActions(claim)}
            />
          ))}
        </div>

        {query.hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
            >
              {query.isFetchingNextPage ? 'Loading…' : 'Load more claims'}
            </button>
          </div>
        )}
      </>
    )
  }

  function renderActions(claim: LostFoundClaimResponse) {
    if (canDecideClaim(user, item, claim)) {
      return (
        <>
          <button
            onClick={() => setPending({ claim, decision: 'APPROVED' })}
            className={`${SMALL_BUTTON} bg-primary text-white hover:bg-primary-700`}
          >
            <Check className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={() => setPending({ claim, decision: 'REJECTED' })}
            className={`${SMALL_BUTTON} border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500 dark:border-[#2D1F4D] dark:text-gray-300`}
          >
            <X className="h-3.5 w-3.5" />
            Decline
          </button>
        </>
      )
    }

    if (canCancelClaim(user, claim)) {
      return (
        <button
          onClick={() => setPending({ claim, decision: 'CANCELLED' })}
          className={`${SMALL_BUTTON} border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500 dark:border-[#2D1F4D] dark:text-gray-300`}
        >
          <X className="h-3.5 w-3.5" />
          Withdraw my claim
        </button>
      )
    }

    return null
  }
}
