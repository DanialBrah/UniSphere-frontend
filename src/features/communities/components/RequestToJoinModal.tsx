import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2 } from 'lucide-react'
import { requestToJoinSchema } from '../schemas'
import type { RequestToJoinFormData } from '../schemas'
import { useRequestToJoin } from '../hooks/useRequestToJoin'
import { inputClass } from '../utils/formUtils'

interface Props {
  communityId: number
  communityName: string
  onClose: () => void
}

export function RequestToJoinModal({ communityId, communityName, onClose }: Props) {
  const { mutateAsync, isPending } = useRequestToJoin(communityId)

  const { register, handleSubmit } = useForm<RequestToJoinFormData>({
    resolver: zodResolver(requestToJoinSchema),
    defaultValues: { message: '' },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function onSubmit(data: RequestToJoinFormData) {
    await mutateAsync(
      { message: data.message || undefined },
      { onSuccess: onClose },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] shadow-xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2D1F4D]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Request to join {communityName}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <textarea
              {...register('message')}
              rows={3}
              placeholder="Add a message for the moderators (optional)"
              className={`${inputClass()} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Send request
          </button>
        </form>
      </div>
    </div>
  )
}
