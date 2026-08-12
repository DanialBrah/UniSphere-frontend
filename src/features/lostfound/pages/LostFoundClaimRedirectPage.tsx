import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { PageSpinner } from '../../../components/ui/PageSpinner'
import { LostFoundErrorState } from '../components/LostFoundStateBlocks'
import { useLostFoundClaim } from '../hooks/useLostFoundClaims'

/**
 * The landing point for a LOST_FOUND_CLAIM notification.
 *
 * The backend sends `targetType: "LOST_FOUND_ITEM"` but puts the **claim** id in `targetId`
 * (`LostFoundClaimService`), so the notification cannot link straight to an item URL. This route
 * resolves the claim, reads `itemId` off it and forwards to the item — which is the page that
 * actually shows the claim, its proof and the approve/decline controls.
 *
 * `replace` so the browser Back button returns to the notification list rather than bouncing
 * through this redirect again.
 */
export default function LostFoundClaimRedirectPage() {
  const { claimId } = useParams<{ claimId: string }>()
  const navigate = useNavigate()
  const numericId = Number(claimId ?? 0)

  const { data: claim, isError, error, refetch } = useLostFoundClaim(numericId)

  useEffect(() => {
    if (claim) navigate(`/lost-found/${claim.itemId}`, { replace: true })
  }, [claim, navigate])

  if (isError) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <LostFoundErrorState
            icon={TriangleAlert}
            title="Couldn't open this claim"
            error={error}
            onRetry={() => refetch()}
          />
        </div>
      </DashboardLayout>
    )
  }

  // Covers the fetch and the tick between data arriving and the redirect effect running.
  return <PageSpinner />
}
