import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createPostSchema, updatePostSchema } from '../schemas'
import type { CreatePostFormData, UpdatePostFormData } from '../schemas'
import { useCreatePost } from '../hooks/useCreatePost'
import { useUpdatePost } from '../hooks/useUpdatePost'
import { mediaApi } from '../api/mediaApi'
import { inputClass } from '../utils/formUtils'
import type { PostMedia, PostResponse } from '../types'

interface Props {
  existingPost?: PostResponse
  onClose: () => void
}

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC',     label: 'Everyone' },
  { value: 'UNIVERSITY', label: 'University only' },
  { value: 'FRIENDS',    label: 'Friends only' },
  { value: 'PRIVATE',    label: 'Only me' },
] as const

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime'
const MAX_MEDIA = 10

interface PendingMedia {
  file: File
  previewUrl: string
}

export function CreatePostModal({ existingPost, onClose }: Props) {
  const isEdit = !!existingPost
  // COMMUNITY posts are visibility-locked server-side (see communities feature) and this form
  // never offers that option, so editing one must never silently downgrade it via the select's
  // default value.
  const isCommunityPost = existingPost?.visibility === 'COMMUNITY'
  const fileRef = useRef<HTMLInputElement>(null)

  // Files selected but not yet uploaded — previewed locally
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([])
  const pendingMediaRef = useRef<PendingMedia[]>([])

  useEffect(() => {
    pendingMediaRef.current = pendingMedia
  }, [pendingMedia])

  // Edit-mode only: track existing server media
  const [remainingMedia, setRemainingMedia] = useState<PostMedia[]>(existingPost?.media ?? [])
  const [removeMediaIds, setRemoveMediaIds] = useState<number[]>([])

  const createPost = useCreatePost()
  const updatePost = useUpdatePost(existingPost?.id ?? 0)

  type FormData = CreatePostFormData | UpdatePostFormData

  // Narrows PostVisibility (which includes 'COMMUNITY') down to the 4 options this form
  // actually offers — a community post falls back to 'PUBLIC' here, but that value is never
  // submitted (see onSubmit) since the select is hidden for community posts.
  const initialVisibility = existingPost && existingPost.visibility !== 'COMMUNITY'
    ? existingPost.visibility
    : 'PUBLIC'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(isEdit ? updatePostSchema : createPostSchema),
    defaultValues: {
      content: existingPost?.content ?? '',
      title: existingPost?.title ?? '',
      visibility: initialVisibility,
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
      pendingMediaRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    e.target.value = ''

    const currentCount = remainingMedia.length + pendingMedia.length
    const allowed = MAX_MEDIA - currentCount
    if (allowed <= 0) {
      toast.error(`Maximum ${MAX_MEDIA} media items allowed`)
      return
    }

    const selected = files.slice(0, allowed)
    if (files.length > allowed) {
      toast.warning(`Only ${allowed} more file${allowed > 1 ? 's' : ''} can be added`)
    }

    const previews: PendingMedia[] = selected.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setPendingMedia((prev) => [...prev, ...previews])
  }

  function handleRemoveExisting(item: PostMedia) {
    setRemoveMediaIds((prev) => [...prev, item.id])
    setRemainingMedia((prev) => prev.filter((m) => m.id !== item.id))
  }

  function handleRemovePending(index: number) {
    setPendingMedia((prev) => {
      const item = prev[index]
      if (item) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  async function onSubmit(data: FormData) {
    // Upload all pending files to B2 on submit
    let uploaded: { mediaKey: string; mediaType: string }[] = []
    if (pendingMedia.length > 0) {
      try {
        uploaded = await Promise.all(
          pendingMedia.map(({ file }) => mediaApi.upload(file)),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        toast.error(`Could not upload file: ${msg}`)
        return
      }
    }

    if (isEdit) {
      const body: UpdatePostFormData & {
        addMedia?: { mediaKey: string; mediaType: string }[]
        removeMediaIds?: number[]
      } = { ...(data as UpdatePostFormData) }
      // Never let this form's (hidden, community-inapplicable) visibility field overwrite a
      // community post's server-forced COMMUNITY visibility.
      if (isCommunityPost) delete body.visibility
      if (uploaded.length > 0) body.addMedia = uploaded
      if (removeMediaIds.length > 0) body.removeMediaIds = removeMediaIds
      await updatePost.mutateAsync(body, { onSuccess: onClose })
    } else {
      await createPost.mutateAsync(
        {
          ...(data as CreatePostFormData),
          media: uploaded.length > 0 ? uploaded : undefined,
        },
        { onSuccess: onClose },
      )
    }
  }

  const isPending = isSubmitting || createPost.isPending || updatePost.isPending
  const totalMedia = remainingMedia.length + pendingMedia.length
  const canAddMore = totalMedia < MAX_MEDIA

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2D1F4D]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit post' : 'Create post'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <input
              {...register('title')}
              type="text"
              placeholder="Title (optional)"
              className={inputClass(!!errors.title)}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
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

          {/* Visibility — community posts are visibility-locked server-side, so this form
              never offers a way to change it (see CreateCommunityPostModal for that flow). */}
          {isCommunityPost ? (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              This is a community post — its visibility is managed by the community.
            </p>
          ) : (
            <div>
              <select {...register('visibility')} className={inputClass()}>
                {VISIBILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Media */}
          <div className="space-y-2">
            {totalMedia > 0 && (
              <div className="flex flex-wrap gap-2">
                {remainingMedia.map((item) => (
                  <MediaThumb
                    key={item.id}
                    url={item.mediaUrl}
                    onRemove={() => handleRemoveExisting(item)}
                    disabled={isPending}
                  />
                ))}
                {pendingMedia.map((item, i) => (
                  <MediaThumb
                    key={i}
                    url={item.previewUrl}
                    onRemove={() => handleRemovePending(i)}
                    isNew
                    disabled={isPending}
                  />
                ))}
              </div>
            )}

            {canAddMore && (
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
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-[#2D1F4D] text-sm text-gray-500 dark:text-gray-400 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50">
                  <ImagePlus size={16} />
                  Add photos or videos{totalMedia > 0 ? ` (${totalMedia}/${MAX_MEDIA})` : ''}
                </button>
              </>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending && pendingMedia.length > 0
              ? 'Uploading…'
              : isEdit
                ? 'Save changes'
                : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}

function MediaThumb({
  url,
  onRemove,
  isNew = false,
  disabled = false,
}: {
  url: string
  onRemove: () => void
  isNew?: boolean
  disabled?: boolean
}) {
  return (
    <div
      className={`relative w-20 h-20 rounded-lg overflow-hidden border ${
        isNew ? 'border-primary/40' : 'border-gray-200 dark:border-[#2D1F4D]'
      }`}
    >
      <img src={url} alt="" className="w-full h-full object-cover" />
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
        >
          <X size={10} />
        </button>
      )}
    </div>
  )
}
