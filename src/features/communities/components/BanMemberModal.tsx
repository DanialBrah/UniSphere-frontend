import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2 } from 'lucide-react'
import { banReasonSchema } from '../schemas'
import type { BanReasonFormData } from '../schemas'
import { useBanMember } from '../hooks/useBanMember'
import { inputClass } from '../utils/formUtils'

interface Props {
  communityId: number
  userId: number
  displayName: string
  onClose: () => void
}

export function BanMemberModal({ communityId, userId, displayName, onClose }: Props) {
  const { mutateAsync, isPending } = useBanMember(communityId)

  const { register, handleSubmit } = useForm<BanReasonFormData>({
    resolver: zodResolver(banReasonSchema),
    defaultValues: { reason: '' },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function onSubmit(data: BanReasonFormData) {
    await mutateAsync({ userId, reason: data.reason || undefined }, { onSuccess: onClose })
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
            Ban {displayName}?
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            They'll be removed and won't be able to rejoin until unbanned.
          </p>
          <textarea
            {...register('reason')}
            rows={2}
            placeholder="Reason (optional)"
            className={`${inputClass()} resize-none`}
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Ban member
          </button>
        </form>
      </div>
    </div>
  )
}
