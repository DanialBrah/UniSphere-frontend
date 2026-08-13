import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useAddProjectRole, useUpdateProjectRole } from '../hooks/useProjectMutations'
import { projectRoleFormSchema, PROJECT_ROLE_DESCRIPTION_MAX, PROJECT_ROLE_TITLE_MAX } from '../schemas'
import type { ProjectRoleFormData } from '../schemas'
import { ERROR_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import type { ProjectRoleResponse } from '../types'

interface ProjectRoleFormModalProps {
  projectId: number
  /** Present in edit mode. */
  existing?: ProjectRoleResponse
  onClose: () => void
}

export function ProjectRoleFormModal({ projectId, existing, onClose }: Readonly<ProjectRoleFormModalProps>) {
  const isEdit = !!existing
  const addRole = useAddProjectRole(projectId)
  const updateRole = useUpdateProjectRole(projectId)
  const isPending = addRole.isPending || updateRole.isPending

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectRoleFormData>({
    resolver: zodResolver(projectRoleFormSchema),
    defaultValues: {
      title: existing?.title ?? '',
      description: existing?.description ?? '',
      slots: existing?.slots?.toString() ?? '1',
    },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function onSubmit(values: ProjectRoleFormData) {
    const slots = values.slots?.trim() ? Number(values.slots) : undefined

    if (isEdit) {
      updateRole.mutate(
        {
          roleId: existing.id,
          body: {
            title: values.title.trim(),
            description: values.description?.trim() ?? '',
            slots,
          },
        },
        { onSuccess: () => onClose() },
      )
      return
    }

    addRole.mutate(
      { title: values.title.trim(), description: values.description?.trim() || undefined, slots },
      { onSuccess: () => onClose() },
    )
  }

  return (
    <dialog
      open
      aria-labelledby="project-role-form-title"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2D1F4D] dark:bg-[#130D22]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="project-role-form-title" className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {isEdit ? 'Edit role' : 'Add an open role'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="project-role-title" className={LABEL_CLASS}>
              Role title <span className="text-red-500">*</span>
            </label>
            <input
              id="project-role-title"
              type="text"
              maxLength={PROJECT_ROLE_TITLE_MAX}
              placeholder="Frontend Developer"
              className={inputClass(!!errors.title)}
              {...register('title')}
            />
            {errors.title && <p className={ERROR_CLASS}>{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="project-role-description" className={LABEL_CLASS}>
              Description
            </label>
            <textarea
              id="project-role-description"
              rows={3}
              maxLength={PROJECT_ROLE_DESCRIPTION_MAX}
              placeholder="What this person would work on, and any skills you're after."
              className={inputClass(!!errors.description)}
              {...register('description')}
            />
            {errors.description && <p className={ERROR_CLASS}>{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="project-role-slots" className={LABEL_CLASS}>
              Slots
            </label>
            <input
              id="project-role-slots"
              type="number"
              min={isEdit ? existing.filledCount || 1 : 1}
              placeholder="1"
              className={inputClass(!!errors.slots)}
              {...register('slots')}
            />
            {errors.slots && <p className={ERROR_CLASS}>{errors.slots.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Save changes' : 'Add role'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
