import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ERROR_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import { ORDER_STATUS_LABEL } from '../utils/display'
import { SERVICE_REASON_MAX } from '../schemas'
import type { ServiceOrderResponse, ServiceOrderStatus } from '../types'

interface ServiceOrderDecisionModalProps {
  order: ServiceOrderResponse
  target: Exclude<ServiceOrderStatus, 'PENDING'>
  /** Only asked for on PENDING->ACCEPTED when the order has no price yet — a NEGOTIABLE order. */
  needsAgreedPrice: boolean
  isPending: boolean
  onConfirm: (reason: string | undefined, agreedPrice: number | undefined) => void
  onCancel: () => void
}

const COPY: Record<Exclude<ServiceOrderStatus, 'PENDING'>, { verb: string; hint: string }> = {
  ACCEPTED: { verb: 'Accept', hint: 'The client is notified and can watch progress from their order page.' },
  IN_PROGRESS: { verb: 'Start work', hint: 'Lets the client know you’ve begun.' },
  COMPLETED: { verb: 'Mark complete', hint: 'The client can then leave a review.' },
  CANCELLED: { verb: 'Cancel', hint: 'The other party is notified, with the note below if you leave one.' },
  DISPUTED: { verb: 'Raise a dispute', hint: 'Flags this order for review — use it if something has gone wrong.' },
}

/**
 * Every non-PENDING transition in the order state machine funnels through this one confirmation
 * shape — a copy of Jobs' `DecideApplicationModal`, plus a conditional `agreedPrice` field for
 * accepting a NEGOTIABLE order that has no price yet.
 */
export function ServiceOrderDecisionModal({
  order,
  target,
  needsAgreedPrice,
  isPending,
  onConfirm,
  onCancel,
}: Readonly<ServiceOrderDecisionModalProps>) {
  const [reason, setReason] = useState('')
  const [agreedPrice, setAgreedPrice] = useState('')
  const [priceError, setPriceError] = useState<string | null>(null)
  const destructive = target === 'CANCELLED' || target === 'DISPUTED'
  const { verb, hint } = COPY[target]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  function handleConfirm() {
    if (needsAgreedPrice) {
      const trimmedPrice = agreedPrice.trim()
      if (!trimmedPrice || Number(trimmedPrice) < 0) {
        setPriceError('Enter an agreed price to accept this order.')
        return
      }
      onConfirm(reason.trim() || undefined, Number(trimmedPrice))
      return
    }
    onConfirm(reason.trim() || undefined, undefined)
  }

  return (
    <dialog
      open
      aria-labelledby="service-order-decision-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="service-order-decision-title" className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
          {verb} order #{order.id}?
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{hint}</p>

        {needsAgreedPrice && (
          <div className="mb-3">
            <label htmlFor="service-order-agreed-price" className={LABEL_CLASS}>
              Agreed price <span className="text-red-500">*</span>
            </label>
            <input
              id="service-order-agreed-price"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={agreedPrice}
              onChange={(e) => {
                setAgreedPrice(e.target.value)
                setPriceError(null)
              }}
              className={inputClass(!!priceError)}
            />
            {priceError && <p className={ERROR_CLASS}>{priceError}</p>}
          </div>
        )}

        <div>
          <label htmlFor="service-order-reason" className={LABEL_CLASS}>
            {ORDER_STATUS_LABEL[target]} note (optional)
          </label>
          <textarea
            id="service-order-reason"
            rows={3}
            maxLength={SERVICE_REASON_MAX}
            placeholder="A short note for the other party."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={inputClass()}
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-300"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={[
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50',
              destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-700',
            ].join(' ')}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {verb}
          </button>
        </div>
      </div>
    </dialog>
  )
}
