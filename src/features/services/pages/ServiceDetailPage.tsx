import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { ServiceDetailHeader } from '../components/ServiceDetailHeader'
import { ServiceOrderPanel } from '../components/ServiceOrderPanel'
import { ServiceReviewList } from '../components/ServiceReviewList'
import { ServiceDetailTabs, type ServiceDetailTab } from '../components/ServiceDetailTabs'
import { ServiceManageTab } from '../components/ServiceManageTab'
import { ServiceErrorState } from '../components/ServiceStateBlocks'
import { ServiceDetailSkeleton } from '../components/ServiceSkeleton'
import { useServiceListing } from '../hooks/useServiceQueries'

export default function ServiceDetailPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ServiceDetailTab>('details')

  const numericId = Number(listingId ?? 0)
  const { data: listing, isPending, isError, error, refetch } = useServiceListing(numericId)

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

        {isPending && <ServiceDetailSkeleton />}

        {isError && (
          <ServiceErrorState
            icon={TriangleAlert}
            title="Couldn't load this listing"
            error={error}
            onRetry={() => refetch()}
          />
        )}

        {listing && (
          <div className="space-y-5">
            <ServiceDetailHeader listing={listing} />

            <ServiceDetailTabs active={tab} onChange={setTab} showManage={listing.canModify} />

            {tab === 'details' && (
              <div className="space-y-5">
                <ServiceOrderPanel listing={listing} />
                <div>
                  <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Reviews</h2>
                  <ServiceReviewList listingId={listing.id} />
                </div>
              </div>
            )}

            {tab === 'manage' && listing.canModify && <ServiceManageTab listing={listing} />}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
