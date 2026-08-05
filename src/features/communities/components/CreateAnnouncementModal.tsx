import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2 } from 'lucide-react'
import { createAnnouncementSchema, updateAnnouncementSchema } from '../schemas'
import type { CreateAnnouncementFormData, UpdateAnnouncementFormData } from '../schemas'
import { useCreateAnnouncement } from '../hooks/useCreateAnnouncement'
import { useUpdateAnnouncement } from '../hooks/useUpdateAnnouncement'
import { inputClass } from '../utils/formUtils'
import type { CommunityAnnouncementResponse } from '../types'

interface Props {
  communityId: number
  existingAnnouncement?: CommunityAnnouncementResponse
  onClose: () => void
}

export function CreateAnnouncementModal({ communityId, existingAnnouncement, onClose }: Props) {
  const isEdit = !!existingAnnouncement
  const createAnnouncement = useCreateAnnouncement(communityId)
  const updateAnnouncement = useUpdateAnnouncement(communityId)

  type FormData = CreateAnnouncementFormData | UpdateAnnouncementFormData

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(isEdit ? updateAnnouncementSchema : createAnnouncementSchema),
    defaultValues: {
      title: existingAnnouncement?.title ?? '',
      content: existingAnnouncement?.content ?? '',
    },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function onSubmit(data: FormData) {
    if (isEdit && existingAnnouncement) {
      await updateAnnouncement.mutateAsync(
        { announcementId: existingAnnouncement.id, ...data },
        { onSuccess: onClose },
      )
    } else {
      await createAnnouncement.mutateAsync(data as CreateAnnouncementFormData, { onSuccess: onClose })
    }
  }

  const isPending = isSubmitting || createAnnouncement.isPending || updateAnnouncement.isPending

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2D1F4D]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit announcement' : 'New announcement'}
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
            <input
              {...register('title')}
              type="text"
              placeholder="Announcement title"
              className={inputClass(!!errors.title)}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <textarea
              {...register('content')}
              rows={5}
              placeholder="Write your announcement…"
              className={`${inputClass(!!errors.content)} resize-none`}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? 'Save changes' : 'Post announcement'}
          </button>
        </form>
      </div>
    </div>
  )
}
