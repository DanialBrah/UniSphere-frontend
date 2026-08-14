import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { ServiceOrderSummaryCard } from '../components/ServiceOrderSummaryCard'
import { ServiceOrderStatusActions } from '../components/ServiceOrderStatusActions'
import { ReviewFormModal } from '../components/ReviewFormModal'
import { ServiceErrorState, ServiceStateBlock } from '../components/ServiceStateBlocks'
import { ServiceDetailSkeleton } from '../components/ServiceSkeleton'
import { useServiceOrder } from '../hooks/useServiceOrders'
import { useOrderReviews } from '../hooks/useServiceReviews'
import { canReviewOrder } from '../utils/permissions'
import { useAuth } from '../../../hooks/useAuth'

export default function ServiceOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showReviewModal, setShowReviewModal] = useState(false)

  const numericId = Number(orderId ?? 0)
  const { data: order, isPending, isError, error, refetch } = useServiceOrder(numericId)
  const isCompleted = order?.status === 'COMPLETED'
  const reviewsQuery = useOrderReviews(numericId, isCompleted)

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {isPending && <ServiceDetailSkeleton />}

        {isError && (
          <ServiceErrorState icon={TriangleAlert} title="Couldn't load this order" error={error} onRetry={() => refetch()} />
        )}

        {order && (() => {
          const isClient = order.client.id === user?.id
          const isProviderOrAdmin = order.provider?.id === user?.id || user?.role === 'ADMIN'
          const alreadyReviewed = (reviewsQuery.data ?? []).some((r) => r.reviewer.id === user?.id)
          const canReview = canReviewOrder(user, order, alreadyReviewed)
          const reviewee = isClient ? order.provider : order.client

          return (
            <div className="space-y-5">
              <ServiceOrderSummaryCard order={order} />

              <ServiceOrderStatusActions order={order} isClient={isClient} isProviderOrAdmin={isProviderOrAdmin} />

              {isCompleted && (
                <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Reviews</h2>

                  {(reviewsQuery.data ?? []).length === 0 && !canReview && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
                  )}

                  {(reviewsQuery.data ?? []).map((review) => (
                    <div key={review.id} className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-900 dark:text-white">
                        {review.reviewer.displayName}
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star size={11} className="fill-amber-400" />
                          {review.rating}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{review.comment}</p>
                      )}
                    </div>
                  ))}

                  {canReview && reviewee && (
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                    >
                      <Star className="h-4 w-4" />
                      Leave a review
                    </button>
                  )}
                </section>
              )}

              {!isClient && !isProviderOrAdmin && (
                <ServiceStateBlock icon={TriangleAlert} title="Limited view" hint="Only this order's client, provider or an admin can manage it." />
              )}

              {showReviewModal && reviewee && (
                <ReviewFormModal
                  orderId={order.id}
                  listingId={order.listingId}
                  revieweeName={reviewee.displayName}
                  onClose={() => setShowReviewModal(false)}
                />
              )}
            </div>
          )
        })()}
      </div>
    </DashboardLayout>
  )
}
