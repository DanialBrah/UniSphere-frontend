import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useCreateServiceOrder } from '../hooks/useServiceOrders'
import { useChatStore } from '../../../stores/chatStore'
import { buildRequestServiceOrderSchema, SERVICE_REQUIREMENTS_MAX } from '../schemas'
import type { RequestServiceOrderFormData } from '../schemas'
import { ERROR_CLASS, HINT_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import type { ServiceListingResponse } from '../types'

interface RequestServiceModalProps {
  listing: ServiceListingResponse
  onClose: () => void
}

/**
 * "Request this service" — places a formal order. The backend auto-opens/reuses a DM with the
 * provider and drops a SYSTEM summary message into it, so a successful submit sends the caller
 * straight to that conversation in the existing messaging feature rather than staying here.
 */
export function RequestServiceModal({ listing, onClose }: Readonly<RequestServiceModalProps>) {
  const navigate = useNavigate()
  const setActiveConversation = useChatStore((s) => s.setActive)
  const isNegotiable = listing.pricingType === 'NEGOTIABLE'
  const createOrder = useCreateServiceOrder(listing.id)

  const schema = useMemo(() => buildRequestServiceOrderSchema(isNegotiable), [isNegotiable])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestServiceOrderFormData>({
    resolver: zodResolver(schema),
    defaultValues: { requirements: '', proposedPrice: '', scheduledAt: '' },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function onSubmit(values: RequestServiceOrderFormData) {
    createOrder.mutate(
      {
        requirements: values.requirements?.trim() || undefined,
        proposedPrice: isNegotiable && values.proposedPrice?.trim() ? Number(values.proposedPrice) : undefined,
        scheduledAt: values.scheduledAt?.trim() || undefined,
      },
      {
        onSuccess: (order) => {
          onClose()
          if (order.conversationId) setActiveConversation(order.conversationId)
          navigate('/messages')
        },
      },
    )
  }

  return (
    <dialog
      open
      aria-labelledby="request-service-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="request-service-title" className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
          Request this service
        </h3>
        <p className="mb-4 truncate text-sm text-gray-500 dark:text-gray-400">{listing.title}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="request-requirements" className={LABEL_CLASS}>
              Requirements (optional)
            </label>
            <textarea
              id="request-requirements"
              rows={4}
              maxLength={SERVICE_REQUIREMENTS_MAX}
              placeholder="What you need, timeline, anything the provider should know upfront."
              className={inputClass(!!errors.requirements)}
              {...register('requirements')}
            />
            {errors.requirements && <p className={ERROR_CLASS}>{errors.requirements.message}</p>}
          </div>

          {isNegotiable && (
            <div>
              <label htmlFor="request-proposed-price" className={LABEL_CLASS}>
                Your proposed price <span className="text-red-500">*</span>
              </label>
              <input
                id="request-proposed-price"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                className={inputClass(!!errors.proposedPrice)}
                {...register('proposedPrice')}
              />
              {errors.proposedPrice && <p className={ERROR_CLASS}>{errors.proposedPrice.message}</p>}
              {!errors.proposedPrice && (
                <p className={HINT_CLASS}>This listing is negotiable — the provider can adjust it when accepting.</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="request-scheduled-at" className={LABEL_CLASS}>
              Preferred time (optional)
            </label>
            <input id="request-scheduled-at" type="datetime-local" className={inputClass()} {...register('scheduledAt')} />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
            <button
              type="button"
              onClick={onClose}
              disabled={createOrder.isPending}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createOrder.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {createOrder.isPending && <Loader2 size={14} className="animate-spin" />}
              Send request
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
