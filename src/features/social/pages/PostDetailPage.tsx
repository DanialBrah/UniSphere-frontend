import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { PostCard } from '../components/PostCard'
import { PostSkeleton } from '../components/PostSkeleton'
import { CommentList } from '../components/CommentList'
import { usePost } from '../hooks/usePost'
import { getErrorMessage } from '../../../lib/utils'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const postId = Number(id)
  const isValidId = id != null && Number.isFinite(postId) && postId > 0

  const { data: post, isLoading, isError, error } = usePost(postId, { enabled: isValidId })

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto w-full">
        {/* Back nav */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-5"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Loading */}
        {isLoading && isValidId && <PostSkeleton />}

        {/* Invalid ID */}
        {!isValidId && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle size={32} className="text-red-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Post not found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This post may have been deleted or you may not have access.
            </p>
          </div>
        )}

        {/* Fetch error */}
        {isValidId && isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle size={32} className="text-red-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Couldn't load post
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getErrorMessage(error)}
            </p>
          </div>
        )}

        {/* Post */}
        {post && (
          <>
            <PostCard post={post} expanded />

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Comments
              </h2>
              <CommentList postId={post.id} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
