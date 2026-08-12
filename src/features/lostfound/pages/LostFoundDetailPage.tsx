import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, HandHeart, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { LostFoundDetailHeader } from '../components/LostFoundDetailHeader'
import { LostFoundLocationPanel } from '../components/LostFoundLocationPanel'
import { LostFoundMediaGallery } from '../components/LostFoundMediaGallery'
import { LostFoundMatchList } from '../components/LostFoundMatchList'
import { LostFoundStatusActions } from '../components/LostFoundStatusActions'
import { ItemClaimList } from '../components/ItemClaimList'
import { ClaimSubmitModal } from '../components/ClaimSubmitModal'
import { LostFoundErrorState } from '../components/LostFoundStateBlocks'
import { LostFoundGridSkeleton } from '../components/LostFoundSkeleton'
import { useLostFoundItem } from '../hooks/useLostFoundQueries'
import { canSubmitClaim } from '../utils/permissions'
import { CLAIM_STATUS_LABEL } from '../utils/display'
import { useAuth } from '../../../hooks/useAuth'
import type { LostFoundClaimStatus } from '../types'

export default function LostFoundDetailPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showClaimModal, setShowClaimModal] = useState(false)

  const numericId = Number(itemId ?? 0)
  const { data: item, isPending, isError, error, refetch } = useLostFoundItem(numericId)

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {isPending && <LostFoundGridSkeleton count={2} />}

        {isError && (
          <LostFoundErrorState
            icon={TriangleAlert}
            title="Couldn't load this item"
            error={error}
            onRetry={() => refetch()}
          />
        )}

        {item && (
          <div className="space-y-5">
            <LostFoundDetailHeader item={item} />

            {/* The owner's controls come first — they're why the reporter opened the page. */}
            {item.canModify && <LostFoundStatusActions item={item} />}

            <LostFoundMatchList item={item} />

            <LostFoundLocationPanel item={item} />

            <LostFoundMediaGallery item={item} />

            {renderClaimCta()}

            {/*
              Only fetched when the viewer can actually see claims: the reporter, or someone who
              has claimed it. Anyone else gets a 403, and this endpoint is rate-limited to 10
              requests a minute including GETs.
            */}
            {(item.canModify || item.viewerClaimStatus != null) && <ItemClaimList item={item} />}
          </div>
        )}

        {showClaimModal && item && (
          <ClaimSubmitModal item={item} onClose={() => setShowClaimModal(false)} />
        )}
      </div>
    </DashboardLayout>
  )

  function renderClaimCta() {
    if (!item) return null

    if (item.viewerClaimStatus) {
      return (
        <div className="rounded-2xl border border-primary/30 bg-primary-50/60 p-4 dark:border-primary/25 dark:bg-primary/10">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Your claim is {CLAIM_STATUS_LABEL[item.viewerClaimStatus].toLowerCase()}
          </p>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            {claimStatusHint(item.viewerClaimStatus)}
          </p>
        </div>
      )
    }

    if (!canSubmitClaim(user, item)) return null

    return (
      <button
        onClick={() => setShowClaimModal(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
      >
        <HandHeart className="h-4 w-4" />
        This is mine — submit a claim
      </button>
    )
  }
}

function claimStatusHint(status: LostFoundClaimStatus): string {
  switch (status) {
    case 'PENDING':
      return "The reporter has been notified and will decide. You'll get a notification either way."
    case 'APPROVED':
      return 'The collection details are now visible above. Arrange the handover with the reporter.'
    case 'REJECTED':
      return 'You can claim again with more detail if this really is your item.'
    case 'CANCELLED':
      return 'You withdrew this claim. You can submit a new one while the item is still open.'
  }
}
