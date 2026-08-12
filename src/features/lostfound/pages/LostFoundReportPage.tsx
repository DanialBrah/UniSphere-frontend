import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { PageSpinner } from '../../../components/ui/PageSpinner'
import { LostFoundReportForm } from '../components/LostFoundReportForm'
import { LostFoundErrorState, LostFoundStateBlock } from '../components/LostFoundStateBlocks'
import { useLostFoundItem } from '../hooks/useLostFoundQueries'
import { useCreateLostFoundItem, useUpdateLostFoundItem } from '../hooks/useLostFoundMutations'
import { isTerminalStatus } from '../utils/permissions'

/**
 * Create and edit in one page.
 *
 * `/lost-found/new` and `/lost-found/:itemId/edit` both land here; the presence of `itemId` is what
 * switches modes. React Router v7 ranks by specificity, so the static `new` segment wins over
 * `:itemId` regardless of declaration order.
 */
export default function LostFoundReportPage() {
  const navigate = useNavigate()
  const { itemId } = useParams<{ itemId: string }>()
  const numericId = Number(itemId ?? 0)
  const isEdit = numericId > 0

  const itemQuery = useLostFoundItem(numericId, { enabled: isEdit })
  const createMutation = useCreateLostFoundItem()
  const updateMutation = useUpdateLostFoundItem(numericId)

  if (isEdit && itemQuery.isPending) return <PageSpinner />

  if (isEdit && itemQuery.isError) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <LostFoundErrorState
            icon={TriangleAlert}
            title="Couldn't load this report"
            error={itemQuery.error}
            onRetry={() => itemQuery.refetch()}
          />
        </div>
      </DashboardLayout>
    )
  }

  const existing = isEdit ? itemQuery.data : undefined

  // `canModify` is computed server-side from the same rule the API enforces, so it's the honest
  // gate here — mirroring the check locally would only add a second place to get it wrong.
  if (existing && !existing.canModify) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <LostFoundStateBlock
            icon={Lock}
            title="You can't edit this report"
            hint="Only the person who reported an item can change it."
            actionLabel="Back to the item"
            onAction={() => navigate(`/lost-found/${numericId}`)}
          />
        </div>
      </DashboardLayout>
    )
  }

  if (existing && isTerminalStatus(existing.status)) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <LostFoundStateBlock
            icon={Lock}
            title="This report is closed"
            hint="Returned and cancelled reports are kept as a record and can no longer be edited."
            actionLabel="Back to the item"
            onAction={() => navigate(`/lost-found/${numericId}`)}
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
            {isEdit ? 'Edit report' : 'Report an item'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {isEdit
              ? 'Update the details so people can still recognise it.'
              : 'Tell us what you lost or found, and pin where it happened.'}
          </p>
        </header>

        <LostFoundReportForm
          existing={existing}
          onCreate={(body) => createMutation.mutateAsync(body)}
          onUpdate={(body) => updateMutation.mutateAsync(body)}
          onDone={(item) => navigate(`/lost-found/${item.id}`, { replace: true })}
          onCancel={() => navigate(-1)}
        />
      </div>
    </DashboardLayout>
  )
}
