import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useApplyToProjectRole } from '../hooks/useProjectApplications'
import { projectApplicationSchema, PROJECT_APPLICATION_MESSAGE_MAX } from '../schemas'
import type { ProjectApplicationFormData } from '../schemas'
import { ERROR_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'

interface ProjectApplyModalProps {
  projectId: number
  roleId: number
  roleTitle: string
  onClose: () => void
}

/**
 * Applying to join a project role — a modal, not an inline panel, so the detail page's role list
 * stays uncluttered. Reuses the same `<dialog>` chrome as `ConfirmModal`. Unlike Jobs' Easy Apply,
 * there's no file to attach — just an optional message, so this posts directly with no upload step.
 */
export function ProjectApplyModal({ projectId, roleId, roleTitle, onClose }: Readonly<ProjectApplyModalProps>) {
  const applyMutation = useApplyToProjectRole()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectApplicationFormData>({
    resolver: zodResolver(projectApplicationSchema),
    defaultValues: { message: '' },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function onSubmit(values: ProjectApplicationFormData) {
    applyMutation.mutate(
      { projectId, roleId, body: { message: values.message?.trim() || undefined } },
      { onSuccess: () => onClose() },
    )
  }

  return (
    <dialog
      open
      aria-labelledby="project-apply-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="project-apply-title" className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
          Apply to join
        </h3>
        <p className="mb-4 truncate text-sm text-gray-500 dark:text-gray-400">{roleTitle}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="project-apply-message" className={LABEL_CLASS}>
              Message (optional)
            </label>
            <textarea
              id="project-apply-message"
              rows={4}
              maxLength={PROJECT_APPLICATION_MESSAGE_MAX}
              placeholder="Why you'd be a good fit for this role."
              className={inputClass(!!errors.message)}
              {...register('message')}
            />
            {errors.message && <p className={ERROR_CLASS}>{errors.message.message}</p>}
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
