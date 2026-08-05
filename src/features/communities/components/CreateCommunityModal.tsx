import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createCommunitySchema, updateCommunitySchema } from '../schemas'
import type { CreateCommunityFormData, UpdateCommunityFormData } from '../schemas'
import { useCreateCommunity } from '../hooks/useCreateCommunity'
import { useUpdateCommunity } from '../hooks/useUpdateCommunity'
import { mediaApi } from '../../social/api/mediaApi'
import { inputClass } from '../utils/formUtils'
import type { CommunityResponse } from '../types'

interface Props {
  existingCommunity?: CommunityResponse
  onClose: () => void
}

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public — anyone can see and join' },
  { value: 'UNIVERSITY_ONLY', label: 'University only' },
  { value: 'PRIVATE', label: 'Private — join by request' },
] as const

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp'

export function CreateCommunityModal({ existingCommunity, onClose }: Props) {
  const isEdit = !!existingCommunity
  const fileRef = useRef<HTMLInputElement>(null)

  const [pendingBanner, setPendingBanner] = useState<{ file: File; previewUrl: string } | null>(null)
  const [bannerRemoved, setBannerRemoved] = useState(false)

  const createCommunity = useCreateCommunity()
  const updateCommunity = useUpdateCommunity(existingCommunity?.id ?? 0)

  type FormData = CreateCommunityFormData | UpdateCommunityFormData

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(isEdit ? updateCommunitySchema : createCommunitySchema),
    defaultValues: {
      name: existingCommunity?.name ?? '',
      description: existingCommunity?.description ?? '',
      visibility: existingCommunity?.visibility ?? 'PUBLIC',
    },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    return () => {
      if (pendingBanner) URL.revokeObjectURL(pendingBanner.previewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (pendingBanner) URL.revokeObjectURL(pendingBanner.previewUrl)
    setPendingBanner({ file, previewUrl: URL.createObjectURL(file) })
    setBannerRemoved(false)
  }

  function handleRemoveBanner() {
    if (pendingBanner) URL.revokeObjectURL(pendingBanner.previewUrl)
    setPendingBanner(null)
    setBannerRemoved(true)
  }

  async function onSubmit(data: FormData) {
    let bannerKey: string | undefined
    if (pendingBanner) {
      try {
        const uploaded = await mediaApi.upload(pendingBanner.file)
        bannerKey = uploaded.mediaKey
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        toast.error(`Could not upload banner: ${msg}`)
        return
      }
    }

    if (isEdit && existingCommunity) {
      const body: UpdateCommunityFormData & { bannerKey?: string } = { ...(data as UpdateCommunityFormData) }
      if (bannerKey) body.bannerKey = bannerKey
      else if (bannerRemoved) body.bannerKey = ''
      await updateCommunity.mutateAsync(body, { onSuccess: onClose })
    } else {
      await createCommunity.mutateAsync(
        { ...(data as CreateCommunityFormData), bannerKey },
        { onSuccess: onClose },
      )
    }
  }

  const isPending = isSubmitting || createCommunity.isPending || updateCommunity.isPending
  const currentBannerUrl = pendingBanner?.previewUrl ?? (!bannerRemoved ? existingCommunity?.bannerUrl : null)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2D1F4D]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Community settings' : 'Create community'}
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
              {...register('name')}
              type="text"
              placeholder="Community name"
              className={inputClass(!!errors.name)}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="What's this community about? (optional)"
              className={`${inputClass(!!errors.description)} resize-none`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <select {...register('visibility')} className={inputClass()}>
              {VISIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {currentBannerUrl && (
              <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-200 dark:border-[#2D1F4D]">
                <img src={currentBannerUrl} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  disabled={isPending}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_TYPES}
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isPending}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-[#2D1F4D] text-sm text-gray-500 dark:text-gray-400 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
            >
              <ImagePlus size={16} />
              {currentBannerUrl ? 'Replace banner' : 'Add a banner image (optional)'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending && pendingBanner ? 'Uploading…' : isEdit ? 'Save changes' : 'Create community'}
          </button>
        </form>
      </div>
    </div>
  )
}
