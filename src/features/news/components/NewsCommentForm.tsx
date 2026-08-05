import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { newsCommentSchema, type NewsCommentFormData } from '../schemas'
import { useCreateNewsComment } from '../hooks/useNewsComments'
import { inputClass } from '../../social/utils/formUtils'
import { useAuth } from '../../../hooks/useAuth'
import { userInitials } from '../../../lib/userDisplay'

interface Props {
  articleId: number
  parentCommentId?: number
  onSuccess?: () => void
  compact?: boolean
}

export function NewsCommentForm({ articleId, parentCommentId, onSuccess, compact = false }: Props) {
  const { user } = useAuth()
  const createComment = useCreateNewsComment(articleId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsCommentFormData>({
    resolver: zodResolver(newsCommentSchema),
    defaultValues: { content: '' },
  })

  async function onSubmit(data: NewsCommentFormData) {
    try {
      await createComment.mutateAsync({ content: data.content, parentCommentId })
      reset()
      onSuccess?.()
    } catch {
      // useCreateNewsComment's onError already toasts.
    }
  }

  if (!user) return null

  const isPending = isSubmitting || createComment.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`flex gap-2 ${compact ? '' : 'mb-4'}`}>
      {!compact && (
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">{userInitials(user)}</span>
        </div>
      )}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex gap-2">
          <textarea
            {...register('content')}
            rows={compact ? 1 : 2}
            placeholder={parentCommentId ? 'Write a reply…' : 'Share your thoughts…'}
            className={`${inputClass(!!errors.content)} resize-none flex-1`}
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Post'}
          </button>
        </div>
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </div>
    </form>
  )
}
