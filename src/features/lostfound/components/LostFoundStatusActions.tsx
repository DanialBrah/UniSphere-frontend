import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Pencil, RotateCcw, Trash2, XCircle } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { useChangeLostFoundStatus, useDeleteLostFoundItem } from '../hooks/useLostFoundMutations'
import { allowedStatusTargets } from '../utils/permissions'
import { STATUS_HINT } from '../utils/display'
import type { LostFoundItemResponse, LostFoundUserStatusTarget } from '../types'

const ACTION_BUTTON =
  'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-primary-50'

/**
 * Copy for each transition the FSM allows. `CLAIMED` and `EXPIRED` never appear: the server writes
 * those itself (claim approval and the nightly sweep respectively) and rejects them on this
 * endpoint with a 409.
 */
const ACTION_COPY: Record<
  LostFoundUserStatusTarget,
  { label: string; title: string; body: string; icon: typeof CheckCircle2 }
> = {
  RESOLVED: {
    label: 'Mark as returned',
    title: 'Mark this as returned?',
    body: 'This closes the listing for good. It stays visible as a record, but it can no longer be claimed or reopened.',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Withdraw listing',
    title: 'Withdraw this listing?',
    body: 'It stops appearing on the board and can no longer be claimed. This cannot be undone.',
    icon: XCircle,
  },
  OPEN: {
    label: 'Reopen',
    title: 'Reopen this listing?',
    body: 'It goes back on the board and can be claimed again. Any approved claim stays on record.',
    icon: RotateCcw,
  },
}

/**
 * Owner controls: the status transitions the server will actually accept, plus edit and delete.
 *
 * Rendered only when `item.canModify` is true — that flag is computed server-side from the same
 * rule the API enforces, so it is the honest gate.
 */
export function LostFoundStatusActions({ item }: Readonly<{ item: LostFoundItemResponse }>) {
  const navigate = useNavigate()
  const [pendingStatus, setPendingStatus] = useState<LostFoundUserStatusTarget | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const changeStatus = useChangeLostFoundStatus(item.id)
  const deleteItem = useDeleteLostFoundItem()

  const targets = allowedStatusTargets(item.status)

  return (
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Manage your report</h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{STATUS_HINT[item.status]}</p>
      </div>

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

        <button onClick={() => navigate(`/lost-found/${item.id}/edit`)} className={ACTION_BUTTON}>
          <Pencil className="h-4 w-4" />
          Edit
        </button>

        <button
          onClick={() => setConfirmDelete(true)}
          className={`${ACTION_BUTTON} hover:!border-red-400 hover:!text-red-500`}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {pendingStatus && (
        <ConfirmModal
          title={ACTION_COPY[pendingStatus].title}
          body={ACTION_COPY[pendingStatus].body}
          confirmLabel={ACTION_COPY[pendingStatus].label}
          destructive={pendingStatus === 'CANCELLED'}
          isPending={changeStatus.isPending}
          onCancel={() => setPendingStatus(null)}
          onConfirm={() =>
            // The server accepts a `note` on this request but never persists it, so offering the
            // user a box to type into would be a lie.
            changeStatus.mutate(
              { status: pendingStatus },
              { onSettled: () => setPendingStatus(null) },
            )
          }
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete this report?"
          body="It disappears from the board and the map straight away. Claims already submitted stay on record but can no longer be acted on."
          confirmLabel="Delete"
          destructive
          isPending={deleteItem.isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            deleteItem.mutate(item.id, {
              onSuccess: () => navigate('/lost-found', { replace: true }),
              onError: () => setConfirmDelete(false),
            })
          }
        />
      )}
    </section>
  )
}
