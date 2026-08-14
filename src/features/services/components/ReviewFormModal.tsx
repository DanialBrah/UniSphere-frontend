import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Star } from 'lucide-react'
import { useCreateServiceReview } from '../hooks/useServiceReviews'
import { serviceReviewSchema, SERVICE_REVIEW_COMMENT_MAX } from '../schemas'
import type { ServiceReviewFormData } from '../schemas'
import { ERROR_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'

interface ReviewFormModalProps {
  orderId: number
  listingId: number
  revieweeName: string
  onClose: () => void
}

export function ReviewFormModal({ orderId, listingId, revieweeName, onClose }: Readonly<ReviewFormModalProps>) {
  const [hoverRating, setHoverRating] = useState(0)
  const createReview = useCreateServiceReview(orderId, listingId)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ServiceReviewFormData>({
    resolver: zodResolver(serviceReviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })
  // useWatch rather than watch — the React Compiler is enabled, and `watch` subscribes the whole
  // component to every keystroke and can't be safely memoized.
  const rating = useWatch({ control, name: 'rating' })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function onSubmit(values: ServiceReviewFormData) {
    createReview.mutate(
      { rating: values.rating, comment: values.comment?.trim() || undefined },
      { onSuccess: () => onClose() },
    )
  }

  return (
    <dialog
      open
      aria-labelledby="review-form-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="review-form-title" className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
          Leave a review
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">For {revieweeName}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <span className={LABEL_CLASS}>
              Rating <span className="text-red-500">*</span>
            </span>
            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onMouseEnter={() => setHoverRating(value)}
                  onClick={() => setValue('rating', value, { shouldValidate: true })}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  className="p-0.5"
                >
                  <Star
                    size={24}
                    className={
                      value <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-white/15'
                    }
                  />
                </button>
              ))}
            </div>
            {errors.rating && <p className={ERROR_CLASS}>{errors.rating.message}</p>}
          </div>

          <div>
            <label htmlFor="review-comment" className={LABEL_CLASS}>
              Comment (optional)
            </label>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={SERVICE_REVIEW_COMMENT_MAX}
              placeholder="How did it go?"
              className={inputClass(!!errors.comment)}
              {...register('comment')}
            />
            {errors.comment && <p className={ERROR_CLASS}>{errors.comment.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
            <button
              type="button"
              onClick={onClose}
              disabled={createReview.isPending}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReview.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {createReview.isPending && <Loader2 size={14} className="animate-spin" />}
              Submit review
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
