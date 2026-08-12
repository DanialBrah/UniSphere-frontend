import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { LostFoundPhotoPicker } from './LostFoundPhotoPicker'
import { lostFoundMediaApi } from '../api/lostFoundMediaApi'
import { useSubmitLostFoundClaim } from '../hooks/useLostFoundClaims'
import { lostFoundClaimSchema, LF_PROOF_TEXT_MAX, LF_PROOF_TEXT_MIN } from '../schemas'
import type { LostFoundClaimFormData } from '../schemas'
import { ERROR_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import type { LostFoundItemResponse, PendingLostFoundMedia } from '../types'

interface ClaimSubmitModalProps {
  item: LostFoundItemResponse
  onClose: () => void
}

export function ClaimSubmitModal({ item, onClose }: Readonly<ClaimSubmitModalProps>) {
  const [proofPhoto, setProofPhoto] = useState<PendingLostFoundMedia | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const submitClaim = useSubmitLostFoundClaim(item.id)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LostFoundClaimFormData>({
    resolver: zodResolver(lostFoundClaimSchema),
    defaultValues: { proofText: '' },
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
      if (proofPhoto) URL.revokeObjectURL(proofPhoto.previewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useWatch, not watch — the React Compiler is enabled and cannot memoize around `watch()`,
  // which the eslint plugin flags as an incompatible library. Same call the News editor makes.
  const proofLength = (useWatch({ control, name: 'proofText' }) ?? '').length

  async function onSubmit(values: LostFoundClaimFormData) {
    setIsUploading(true)
    try {
      // Uploaded at submit, not at file-select: a presigned PUT expires after five minutes.
      const proofImageKey = proofPhoto
        ? (await lostFoundMediaApi.upload(proofPhoto.file)).mediaKey
        : undefined

      await submitClaim.mutateAsync(
        { proofText: values.proofText.trim(), proofImageKey },
        { onSuccess: onClose },
      )
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes('upload')) {
        toast.error("The photo upload didn't go through. Please try again.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  const busy = isSubmitting || isUploading

  return (
    <dialog
      open
      aria-labelledby="lf-claim-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b border-gray-200 p-5 dark:border-[#2D1F4D]">
          <h3
            id="lf-claim-title"
            className="text-base font-semibold text-gray-900 dark:text-white"
          >
            Claim &ldquo;{item.title}&rdquo;
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The reporter decides. Describe something only the owner would know.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
          {/*
            The reporter is holding a private identifying detail the claimant cannot see — that
            asymmetry is the whole adjudication mechanism, and saying so out loud is what makes
            people write a useful claim instead of "that's mine".
          */}
          <div className="flex gap-2.5 rounded-xl bg-primary-50 p-3 dark:bg-primary/10">
            <ShieldCheck className="h-4 w-4 shrink-0 translate-y-px text-primary" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              The reporter noted a private detail about this item. Mention marks, contents, a lock
              screen, where you lost it — anything a stranger couldn&apos;t guess.
            </p>
          </div>

          <div>
            <label htmlFor="lf-proof" className={LABEL_CLASS}>
              Proof of ownership <span className="text-red-500">*</span>
            </label>
            <textarea
              id="lf-proof"
              rows={5}
              maxLength={LF_PROOF_TEXT_MAX}
              placeholder="It's a black Anker power bank with a chipped corner and a blue sticker on the back. I lost it near the library on Tuesday."
              className={inputClass(!!errors.proofText)}
              {...register('proofText')}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.proofText ? (
                <p className={ERROR_CLASS}>{errors.proofText.message}</p>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  At least {LF_PROOF_TEXT_MIN} characters
                </span>
              )}
              <span
                className={`text-xs ${proofLength < LF_PROOF_TEXT_MIN ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {proofLength}/{LF_PROOF_TEXT_MAX}
              </span>
            </div>
          </div>

          <LostFoundPhotoPicker
            label="Supporting photo (optional)"
            hint="A receipt, an older photo of you with the item, the box it came in."
            existingUrl={null}
            pending={proofPhoto}
            onPick={setProofPhoto}
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              Submit claim
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
