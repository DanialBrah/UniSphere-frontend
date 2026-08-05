import { formatDistanceToNow } from 'date-fns'
import { Check, Loader2, X } from 'lucide-react'
import { useApproveJoinRequest } from '../hooks/useApproveJoinRequest'
import { useRejectJoinRequest } from '../hooks/useRejectJoinRequest'
import type { CommunityJoinRequestResponse } from '../types'

export function JoinRequestRow({
  communityId,
  request,
}: {
  communityId: number
  request: CommunityJoinRequestResponse
}) {
  const { mutate: approve, isPending: isApproving } = useApproveJoinRequest(communityId)
  const { mutate: reject, isPending: isRejecting } = useRejectJoinRequest(communityId)
  const isPending = isApproving || isRejecting
  const timestamp = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })

  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#130D22] border border-gray-200 dark:border-[#2D1F4D]">
      {request.avatarUrl ? (
        <img src={request.avatarUrl} alt={request.displayName} className="w-9 h-9 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">
            {request.displayName.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{request.displayName}</p>
        {request.message && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{request.message}</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timestamp}</p>
      </div>

      {request.status === 'PENDING' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => approve(request.id)}
            disabled={isPending}
            aria-label="Approve"
            className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 disabled:opacity-50 transition-colors"
          >
            {isApproving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
          <button
            onClick={() => reject(request.id)}
            disabled={isPending}
            aria-label="Reject"
            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 transition-colors"
          >
            {isRejecting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
          </button>
        </div>
      )}

      {request.status !== 'PENDING' && (
        <span
          className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-semibold ${
            request.status === 'APPROVED'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {request.status}
        </span>
      )}
    </div>
  )
}
