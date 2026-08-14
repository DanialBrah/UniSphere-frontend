import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { PageSpinner } from '../../../components/ui/PageSpinner'
import { ServiceForm } from '../components/ServiceForm'
import { ServiceErrorState, ServiceStateBlock } from '../components/ServiceStateBlocks'
import { useServiceListing } from '../hooks/useServiceQueries'
import { useCreateServiceListing, useUpdateServiceListing } from '../hooks/useServiceMutations'
import { canCreateService } from '../utils/permissions'
import { useAuth } from '../../../hooks/useAuth'

/**
 * Create and edit in one page.
 *
 * `/services/new` and `/services/:listingId/edit` both land here; the presence of `listingId` is
 * what switches modes. React Router v7 ranks by specificity, so the static `new` segment wins over
 * `:listingId` regardless of declaration order.
 */
export default function ServiceFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { listingId } = useParams<{ listingId: string }>()
  const numericId = Number(listingId ?? 0)
  const isEdit = numericId > 0

  const listingQuery = useServiceListing(numericId, { enabled: isEdit })
  const createMutation = useCreateServiceListing()
  const updateMutation = useUpdateServiceListing(numericId)

  // Posting is STUDENT/ALUMNI/CLUB-only. Edit-mode needs no separate check: the canModify guard
  // below already turns away any non-owner.
  if (!isEdit && !canCreateService(user)) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <ServiceStateBlock
            icon={Lock}
            title="Only student, alumni and club accounts can offer services"
            hint="Sign in with an eligible account to create a listing."
            actionLabel="Back to services"
            onAction={() => navigate('/services')}
          />
        </div>
      </DashboardLayout>
    )
  }

  if (isEdit && listingQuery.isPending) return <PageSpinner />

  if (isEdit && listingQuery.isError) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <ServiceErrorState
            icon={TriangleAlert}
            title="Couldn't load this listing"
            error={listingQuery.error}
            onRetry={() => listingQuery.refetch()}
          />
        </div>
      </DashboardLayout>
    )
  }

  const existing = isEdit ? listingQuery.data : undefined

  // `canModify` is computed server-side from the same rule the API enforces, so it's the honest
  // gate here — mirroring the check locally would only add a second place to get it wrong.
  if (existing && !existing.canModify) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <ServiceStateBlock
            icon={Lock}
            title="You can't edit this listing"
            hint="Only the provider who created it can change it."
            actionLabel="Back to the listing"
            onAction={() => navigate(`/services/${numericId}`)}
          />
        </div>
      </DashboardLayout>
    )
  }

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

        <header className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit service listing' : 'Offer a service'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {isEdit
              ? 'Update the details — visible to everyone immediately.'
              : "Published right away — pause it any time from the listing's Manage tab."}
          </p>
        </header>

        <ServiceForm
          existing={existing}
          onCreate={(body) => createMutation.mutateAsync(body)}
          onUpdate={(body) => updateMutation.mutateAsync(body)}
          onDone={(listing) => navigate(`/services/${listing.id}`, { replace: true })}
          onCancel={() => navigate(-1)}
        />
      </div>
    </DashboardLayout>
  )
}
