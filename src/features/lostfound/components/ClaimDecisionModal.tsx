import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useDecideLostFoundClaim } from '../hooks/useLostFoundClaims'
import { lostFoundClaimDecisionSchema, LF_DECISION_NOTE_MAX } from '../schemas'
import type { LostFoundClaimDecisionFormData } from '../schemas'
import { ERROR_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import type { LostFoundClaimResponse } from '../types'

type Decision = 'APPROVED' | 'REJECTED' | 'CANCELLED'

interface ClaimDecisionModalProps {
  claim: LostFoundClaimResponse
  decision: Decision
  itemId: number
  /** Pending claims that will be auto-rejected if this one is approved. */
  siblingPendingCount: number
  onClose: () => void
}

const COPY: Record<Decision, { title: string; body: string; confirm: string }> = {
  APPROVED: {
    title: 'Approve this claim?',
    body: 'The claimant gets your collection point and instructions, and the item is marked as claimed.',
    confirm: 'Approve claim',
  },
  REJECTED: {
    title: 'Decline this claim?',
    body: 'The claimant is notified. The item stays open, and they can claim again with better proof.',
    confirm: 'Decline claim',
  },
  CANCELLED: {
    title: 'Withdraw your claim?',
    body: 'The reporter is no longer asked to decide on it. You can submit a new claim later if you need to.',
    confirm: 'Withdraw claim',
  },
}

export function ClaimDecisionModal({
  claim,
  decision,
  itemId,
  siblingPendingCount,
  onClose,
}: Readonly<ClaimDecisionModalProps>) {
  const decide = useDecideLostFoundClaim(itemId)
  const copy = COPY[decision]

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LostFoundClaimDecisionFormData>({
    resolver: zodResolver(lostFoundClaimDecisionSchema),
    defaultValues: { decisionNote: '' },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function onSubmit(values: LostFoundClaimDecisionFormData) {
    decide.mutate(
      { claimId: claim.id, status: decision, decisionNote: values.decisionNote?.trim() || undefined },
      { onSuccess: onClose },
    )
  }

  return (
    <dialog
      open
      aria-labelledby="lf-decision-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="lf-decision-title"
          className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white"
        >
          {copy.title}
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{copy.body}</p>

        {/*
          Approving is one server transaction that also auto-rejects every sibling PENDING claim.
          That is irreversible and invisible from this modal, so it has to be stated before the
          click, not discovered afterwards in the claim list.
        */}
        {decision === 'APPROVED' && siblingPendingCount > 0 && (
          <div className="mb-4 flex gap-2.5 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 shrink-0 translate-y-px text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {siblingPendingCount} other pending{' '}
              {siblingPendingCount === 1 ? 'claim' : 'claims'} on this item will be declined
              automatically.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="lf-decision-note" className={LABEL_CLASS}>
              {decision === 'CANCELLED' ? 'Reason (optional)' : 'Note to the claimant (optional)'}
            </label>
            <textarea
              id="lf-decision-note"
              rows={3}
              maxLength={LF_DECISION_NOTE_MAX}
              placeholder={
                decision === 'APPROVED'
                  ? 'Come to the security desk any weekday before 5pm.'
                  : 'The description didn’t match the item.'
              }
              className={inputClass(!!errors.decisionNote)}
              {...register('decisionNote')}
            />
            {errors.decisionNote && <p className={ERROR_CLASS}>{errors.decisionNote.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={decide.isPending}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={decide.isPending}
              className={[
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50',
                decision === 'APPROVED'
                  ? 'bg-primary hover:bg-primary-700'
                  : 'bg-red-500 hover:bg-red-600',
              ].join(' ')}
            >
              {decide.isPending && <Loader2 size={14} className="animate-spin" />}
              {copy.confirm}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
