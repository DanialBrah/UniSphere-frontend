import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { JobResumePicker } from './JobResumePicker'
import { useApplyToJob } from '../hooks/useJobApplications'
import { jobApplicationSchema, JOB_COVER_LETTER_MAX } from '../schemas'
import type { JobApplicationFormData } from '../schemas'
import { ERROR_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'

interface JobApplyModalProps {
  jobId: number
  jobTitle: string
  onClose: () => void
}

/**
 * The Easy Apply form — a modal, not an inline panel, unlike Events' single-click Register: this
 * collects a file plus optional text, so a modal keeps the detail page uncluttered. Reuses the same
 * `<dialog>` chrome as `ConfirmModal`, not a new UI primitive.
 */
export function JobApplyModal({ jobId, jobTitle, onClose }: Readonly<JobApplyModalProps>) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeError, setResumeError] = useState<string | null>(null)
  const applyMutation = useApplyToJob(jobId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: { coverLetter: '' },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function onSubmit(values: JobApplicationFormData) {
    if (!resumeFile) {
      setResumeError('Attach your résumé to apply.')
      return
    }
    setResumeError(null)
    applyMutation.mutate(
      { file: resumeFile, coverLetter: values.coverLetter },
      { onSuccess: () => onClose() },
    )
  }

  return (
    <dialog
      open
      aria-labelledby="job-apply-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="job-apply-title" className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
          Easy Apply
        </h3>
        <p className="mb-4 truncate text-sm text-gray-500 dark:text-gray-400">{jobTitle}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <JobResumePicker file={resumeFile} onPick={setResumeFile} error={resumeError ?? undefined} />

          <div>
            <label htmlFor="job-apply-cover-letter" className={LABEL_CLASS}>
              Cover letter (optional)
            </label>
            <textarea
              id="job-apply-cover-letter"
              rows={4}
              maxLength={JOB_COVER_LETTER_MAX}
              placeholder="Why you're a good fit for this role."
              className={inputClass(!!errors.coverLetter)}
              {...register('coverLetter')}
            />
            {errors.coverLetter && <p className={ERROR_CLASS}>{errors.coverLetter.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
            <button
              type="button"
              onClick={onClose}
              disabled={applyMutation.isPending}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {applyMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Submit application
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
