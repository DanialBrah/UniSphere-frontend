import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createCommunityPostSchema } from '../schemas'
import type { CreateCommunityPostFormData } from '../schemas'
import { useCreateCommunityPost } from '../hooks/useCreateCommunityPost'
import { mediaApi } from '../../social/api/mediaApi'
import { inputClass } from '../utils/formUtils'

interface Props {
  communityId: number
  onClose: () => void
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime'
const MAX_MEDIA = 10

interface PendingMedia {
  file: File
  previewUrl: string
}

export function CreateCommunityPostModal({ communityId, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([])
  const pendingMediaRef = useRef<PendingMedia[]>([])

  useEffect(() => {
    pendingMediaRef.current = pendingMedia
  }, [pendingMedia])

  const createPost = useCreateCommunityPost(communityId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommunityPostFormData>({
    resolver: zodResolver(createCommunityPostSchema),
    defaultValues: { title: '', content: '' },
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
      pendingMediaRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    e.target.value = ''

    const allowed = MAX_MEDIA - pendingMedia.length
    if (allowed <= 0) {
      toast.error(`Maximum ${MAX_MEDIA} media items allowed`)
      return
    }

    const selected = files.slice(0, allowed)
    if (files.length > allowed) {
      toast.warning(`Only ${allowed} more file${allowed > 1 ? 's' : ''} can be added`)
    }

    setPendingMedia((prev) => [
      ...prev,
      ...selected.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ])
  }

  function handleRemovePending(index: number) {
    setPendingMedia((prev) => {
      const item = prev[index]
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function onSubmit(data: CreateCommunityPostFormData) {
    let uploaded: { mediaKey: string; mediaType: string }[] = []
    if (pendingMedia.length > 0) {
      try {
        uploaded = await Promise.all(pendingMedia.map(({ file }) => mediaApi.upload(file)))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        toast.error(`Could not upload file: ${msg}`)
        return
      }
    }

    await createPost.mutateAsync(
      { ...data, media: uploaded.length > 0 ? uploaded : undefined },
      { onSuccess: onClose },
    )
  }

  const isPending = isSubmitting || createPost.isPending

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
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Create post</h2>
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
              placeholder="Title (optional)"
              className={inputClass(!!errors.title)}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <textarea
              {...register('content')}
              rows={4}
              placeholder="What's on your mind?"
              className={`${inputClass(!!errors.content)} resize-none`}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            {pendingMedia.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pendingMedia.map((item, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-primary/40"
                  >
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePending(i)}
                      disabled={isPending}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {pendingMedia.length < MAX_MEDIA && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  multiple
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
                  Add photos or videos{pendingMedia.length > 0 ? ` (${pendingMedia.length}/${MAX_MEDIA})` : ''}
                </button>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending && pendingMedia.length > 0 ? 'Uploading…' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}
