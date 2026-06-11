import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { createCommentSchema } from '../schemas'
import type { CreateCommentFormData } from '../schemas'
import { useCreateComment } from '../hooks/useCreateComment'
import { inputClass } from '../utils/formUtils'
import { useAuth } from '../../../hooks/useAuth'

interface Props {
  postId: number
  parentCommentId?: number
  onSuccess?: () => void
  placeholder?: string
  compact?: boolean
}

export function CommentForm({ postId, parentCommentId, onSuccess, placeholder, compact = false }: Props) {
  const { user } = useAuth()
  const createComment = useCreateComment(postId)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { content: '' },
  })

  async function onSubmit(data: CreateCommentFormData) {
    await createComment.mutateAsync(
      { content: data.content, parentCommentId },
      {
        onSuccess: () => {
          reset()
          onSuccess?.()
        },
      },
    )
  }

  if (!user) return null

  const initials = (user as { fullName?: string; companyName?: string; name?: string })
    ? (() => {
        const name =
          ('fullName' in user && user.fullName) ||
          ('companyName' in user && user.companyName) ||
          ('name' in user && user.name) ||
          user.email ||
          '?'
        return String(name)
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      })()
    : '?'

  const isPending = isSubmitting || createComment.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`flex gap-2 ${compact ? '' : 'mb-4'}`}>
      {!compact && (
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>
      )}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex gap-2">
          <textarea
            {...register('content')}
            rows={compact ? 1 : 2}
            placeholder={placeholder ?? (parentCommentId ? 'Write a reply…' : 'Write a comment…')}
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
        {errors.content && (
          <p className="text-xs text-red-500">{errors.content.message}</p>
        )}
      </div>
    </form>
  )
}
