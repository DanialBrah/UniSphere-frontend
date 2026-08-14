import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pause, Pencil, Play, Trash2 } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { useChangeServiceListingStatus, useDeleteServiceListing } from '../hooks/useServiceMutations'
import { useServiceListingStats } from '../hooks/useServiceQueries'
import { allowedListingStatusTargets } from '../utils/permissions'
import type { ServiceListingResponse, ServiceListingStatus } from '../types'

const ACTION_BUTTON =
  'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-primary-50'
const DISABLED_BUTTON =
  'inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-400 opacity-60 dark:border-[#2D1F4D] dark:text-gray-500'

const ACTION_COPY: Record<
  ServiceListingStatus,
  { label: string; title: string; body: string; icon: typeof Play }
> = {
  ACTIVE: {
    label: 'Resume',
    title: 'Resume this listing?',
    body: 'It becomes visible on Browse and search again, and starts accepting orders.',
    icon: Play,
  },
  PAUSED: {
    label: 'Pause',
    title: 'Pause this listing?',
    body: "It drops off Browse and search until you resume it. You'll still see it under My Listings.",
    icon: Pause,
  },
}

/**
 * Owner/ADMIN controls: the availability toggle, plus edit and delete. Rendered only when
 * `listing.canModify` is true — that flag is computed server-side from the same rule the API
 * enforces, so it is the honest gate.
 */
export function ServiceStatusActions({ listing }: Readonly<{ listing: ServiceListingResponse }>) {
  const navigate = useNavigate()
  const [pendingStatus, setPendingStatus] = useState<ServiceListingStatus | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const changeStatus = useChangeServiceListingStatus(listing.id)
  const deleteListing = useDeleteServiceListing()
  // Delete is blocked server-side while any non-terminal order exists — the listing summary alone
  // doesn't carry an order count, so the stats breakdown (already fetched for this tab) is the source.
  const { data: stats } = useServiceListingStats(listing.id, true)

  const targets = allowedListingStatusTargets(listing.status)
  const blockedByOrders = !!stats && stats.pending + stats.accepted + stats.inProgress > 0

  return (
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Manage this listing</h2>

      <div className="flex flex-wrap gap-2">
        {targets.map((target) => {
          const { label, icon: Icon } = ACTION_COPY[target]
          return (
            <button key={target} onClick={() => setPendingStatus(target)} className={ACTION_BUTTON}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}

        <button onClick={() => navigate(`/services/${listing.id}/edit`)} className={ACTION_BUTTON}>
          <Pencil className="h-4 w-4" />
          Edit
        </button>

        <button
          onClick={() => !blockedByOrders && setConfirmDelete(true)}
          disabled={blockedByOrders}
          title={blockedByOrders ? 'Resolve orders in progress before deleting this listing' : undefined}
          className={blockedByOrders ? DISABLED_BUTTON : `${ACTION_BUTTON} hover:!border-red-400 hover:!text-red-500`}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {blockedByOrders && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This listing has orders in progress — resolve them before deleting it.
        </p>
      )}

      {pendingStatus && (
        <ConfirmModal
          title={ACTION_COPY[pendingStatus].title}
          body={ACTION_COPY[pendingStatus].body}
          confirmLabel={ACTION_COPY[pendingStatus].label}
          isPending={changeStatus.isPending}
          onCancel={() => setPendingStatus(null)}
          onConfirm={() =>
            changeStatus.mutate({ status: pendingStatus }, { onSettled: () => setPendingStatus(null) })
          }
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete this listing?"
          body="It disappears from Browse straight away. This cannot be undone."
          confirmLabel="Delete"
          destructive
          isPending={deleteListing.isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            deleteListing.mutate(listing.id, {
              onSuccess: () => navigate('/services', { replace: true }),
              onError: () => setConfirmDelete(false),
            })
          }
        />
      )}
    </section>
  )
}
