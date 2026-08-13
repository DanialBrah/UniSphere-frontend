import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ProjectCoverPicker } from './ProjectCoverPicker'
import { projectMediaApi } from '../api/projectMediaApi'
import { projectFormSchema, PROJECT_DESCRIPTION_MAX, PROJECT_TITLE_MAX, PROJECT_URL_MAX } from '../schemas'
import type { ProjectFormData } from '../schemas'
import { ERROR_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import type { CreateProjectRequest, PendingProjectCover, ProjectResponse, UpdateProjectRequest } from '../types'

interface ProjectFormProps {
  /** Present in edit mode. */
  existing?: ProjectResponse
  onCreate?: (body: CreateProjectRequest) => Promise<ProjectResponse>
  onUpdate?: (body: UpdateProjectRequest) => Promise<ProjectResponse>
  onDone: (project: ProjectResponse) => void
  onCancel: () => void
}

/** A blank string clears a nullable text field server-side; `undefined` leaves it untouched. */
const trimmed = (value: string | undefined): string | undefined => value?.trim() || undefined

export function ProjectForm({ existing, onCreate, onUpdate, onDone, onCancel }: Readonly<ProjectFormProps>) {
  const isEdit = !!existing

  const [cover, setCover] = useState<PendingProjectCover | null>(null)
  const [coverRemoved, setCoverRemoved] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: existing?.title ?? '',
      description: existing?.description ?? '',
      githubUrl: existing?.githubUrl ?? '',
      demoUrl: existing?.demoUrl ?? '',
    },
  })

  // Blob URLs are process-global; without this an abandoned draft leaks its preview.
  useEffect(() => {
    return () => {
      if (cover) URL.revokeObjectURL(cover.previewUrl)
    }
    // Cleanup only — re-running on every staged file would revoke a URL still on screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: ProjectFormData) {
    setIsUploading(true)
    try {
      // The upload happens here rather than at file-select, because a presigned PUT URL expires
      // after about five minutes and filling in this form routinely takes longer.
      const coverImageKey = cover ? (await projectMediaApi.upload(cover.file)).mediaKey : undefined

      const project =
        isEdit && onUpdate
          ? await onUpdate(buildUpdateBody(values, coverImageKey))
          : await onCreate!(buildCreateBody(values, coverImageKey))

      onDone(project)
    } catch (err) {
      // The mutation hooks already toast the API error; this only covers an upload that failed
      // before any request was made, which would otherwise fail silently.
      if (err instanceof Error && err.message.toLowerCase().includes('upload')) {
        toast.error("The cover image upload didn't go through. Please try again.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  function buildCreateBody(values: ProjectFormData, coverImageKey: string | undefined): CreateProjectRequest {
    return {
      title: values.title.trim(),
      description: trimmed(values.description),
      coverImageKey,
      githubUrl: trimmed(values.githubUrl),
      demoUrl: trimmed(values.demoUrl),
    }
  }

  function buildUpdateBody(values: ProjectFormData, coverImageKey: string | undefined): UpdateProjectRequest {
    return {
      title: values.title.trim(),
      description: values.description?.trim() ?? '',
      coverImageKey: coverImageKey ?? (coverRemoved ? '' : undefined),
      githubUrl: values.githubUrl?.trim() ?? '',
      demoUrl: values.demoUrl?.trim() ?? '',
    }
  }

  const busy = isSubmitting || isUploading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="project-title" className={LABEL_CLASS}>
          Project title <span className="text-red-500">*</span>
        </label>
        <input
          id="project-title"
          type="text"
          maxLength={PROJECT_TITLE_MAX}
          placeholder="Campus Ride-Sharing App"
          className={inputClass(!!errors.title)}
          {...register('title')}
        />
        {errors.title && <p className={ERROR_CLASS}>{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="project-description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="project-description"
          rows={5}
          maxLength={PROJECT_DESCRIPTION_MAX}
          placeholder="What you're building, the tech stack, and what makes it worth joining."
          className={inputClass(!!errors.description)}
          {...register('description')}
        />
        {errors.description && <p className={ERROR_CLASS}>{errors.description.message}</p>}
      </div>

      <ProjectCoverPicker
        existingUrl={existing?.coverImageUrl ?? null}
        pending={cover}
        onPick={setCover}
        removed={coverRemoved}
        onRemove={() => setCoverRemoved(true)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="project-github" className={LABEL_CLASS}>
            GitHub link
          </label>
          <input
            id="project-github"
            type="text"
            maxLength={PROJECT_URL_MAX}
            placeholder="https://github.com/you/project"
            className={inputClass(!!errors.githubUrl)}
            {...register('githubUrl')}
          />
          {errors.githubUrl && <p className={ERROR_CLASS}>{errors.githubUrl.message}</p>}
        </div>
        <div>
          <label htmlFor="project-demo" className={LABEL_CLASS}>
            Demo link
          </label>
          <input
            id="project-demo"
            type="text"
            maxLength={PROJECT_URL_MAX}
            placeholder="https://your-demo.example.com"
            className={inputClass(!!errors.demoUrl)}
            {...register('demoUrl')}
          />
          {errors.demoUrl && <p className={ERROR_CLASS}>{errors.demoUrl.message}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Showcase project'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:text-primary disabled:opacity-50 dark:text-gray-400"
        >
          Cancel
        </button>
        {!isEdit && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Add open roles and switch on recruiting from the project page once it's created.
          </span>
        )}
      </div>
    </form>
  )
}
