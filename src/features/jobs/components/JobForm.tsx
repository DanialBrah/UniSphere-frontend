import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { JobLocationField } from './JobLocationField'
import {
  buildJobFormSchema,
  JOB_DESCRIPTION_MAX,
  JOB_EXTERNAL_URL_MAX,
  JOB_REQUIREMENTS_MAX,
  JOB_TITLE_MAX,
} from '../schemas'
import type { JobFormData } from '../schemas'
import {
  EXPERIENCE_LEVEL_LABEL,
  EXPERIENCE_LEVEL_ORDER,
  JOB_TYPE_LABEL,
  JOB_TYPE_ORDER,
  WORK_MODE_LABEL,
  WORK_MODE_ORDER,
} from '../utils/display'
import { ERROR_CLASS, HINT_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import { todayDateValue } from '../utils/dateUtils'
import type { CreateJobRequest, JobResponse, UpdateJobRequest } from '../types'

interface JobFormProps {
  /** Present in edit mode. */
  existing?: JobResponse
  onCreate?: (body: CreateJobRequest) => Promise<JobResponse>
  onUpdate?: (body: UpdateJobRequest) => Promise<JobResponse>
  onDone: (job: JobResponse) => void
  onCancel: () => void
}

/** A blank string clears a nullable text field server-side; `undefined` leaves it untouched. */
const trimmed = (value: string | undefined): string | undefined => value?.trim() || undefined

export function JobForm({ existing, onCreate, onUpdate, onDone, onCancel }: Readonly<JobFormProps>) {
  const isEdit = !!existing

  // The one field the future-deadline rule differs on between create and edit — see schemas/index.ts.
  const schema = useMemo(() => buildJobFormSchema(isEdit), [isEdit])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: existing?.title ?? '',
      description: existing?.description ?? '',
      requirements: existing?.requirements ?? '',
      jobType: existing?.jobType ?? 'FULL_TIME',
      workMode: existing?.workMode ?? 'ON_SITE',
      experienceLevel: existing?.experienceLevel ?? 'ENTRY_LEVEL',
      location: existing?.location ?? '',
      salaryMin: existing?.salaryMin?.toString() ?? '',
      salaryMax: existing?.salaryMax?.toString() ?? '',
      salaryCurrency: existing?.salaryCurrency ?? 'MYR',
      applicationMode: existing?.applicationMode ?? 'INTERNAL',
      externalApplyUrl: existing?.externalApplyUrl ?? '',
      applicationDeadline: existing?.applicationDeadline ?? '',
      universityId: existing?.universityId?.toString() ?? '',
    },
  })

  // useWatch rather than watch — the React Compiler is enabled, and `watch` subscribes the whole
  // component to every keystroke. Hoisted out of JSX so the hook order stays obvious.
  const workMode = useWatch({ control, name: 'workMode' })
  const location = useWatch({ control, name: 'location' }) ?? ''
  const applicationMode = useWatch({ control, name: 'applicationMode' })

  // Switching to Remote clears whatever location was entered, so the two states never both hold data.
  function handleWorkModeChange(value: (typeof WORK_MODE_ORDER)[number]) {
    setValue('workMode', value)
    if (value === 'REMOTE') setValue('location', '')
  }

  // Switching to Internal clears the external link, so the two modes never both hold data.
  function handleApplicationModeChange(value: 'INTERNAL' | 'EXTERNAL') {
    setValue('applicationMode', value)
    if (value === 'INTERNAL') setValue('externalApplyUrl', '')
  }

  async function onSubmit(values: JobFormData) {
    try {
      const job =
        isEdit && onUpdate
          ? await onUpdate(buildUpdateBody(values, existing))
          : await onCreate!(buildCreateBody(values))
      onDone(job)
    } catch {
      // The mutation hooks already toast the API error — nothing else to do here.
    }
  }

  function buildCreateBody(values: JobFormData): CreateJobRequest {
    return {
      title: values.title.trim(),
      description: trimmed(values.description),
      requirements: trimmed(values.requirements),
      jobType: values.jobType,
      workMode: values.workMode,
      experienceLevel: values.experienceLevel,
      location: values.workMode === 'REMOTE' ? undefined : trimmed(values.location),
      salaryMin: values.salaryMin?.trim() ? Number(values.salaryMin) : undefined,
      salaryMax: values.salaryMax?.trim() ? Number(values.salaryMax) : undefined,
      salaryCurrency: values.salaryCurrency.trim().toUpperCase(),
      applicationMode: values.applicationMode,
      externalApplyUrl: values.applicationMode === 'EXTERNAL' ? trimmed(values.externalApplyUrl) : undefined,
      applicationDeadline: values.applicationDeadline?.trim() || undefined,
      universityId: values.universityId?.trim() ? Number(values.universityId) : undefined,
    }
  }

  function buildUpdateBody(values: JobFormData, existing?: JobResponse): UpdateJobRequest {
    const hadSalary = existing?.salaryMin != null || existing?.salaryMax != null
    const hadDeadline = existing?.applicationDeadline != null
    const hadUniversityId = existing?.universityId != null
    const salaryMin = values.salaryMin?.trim() ? Number(values.salaryMin) : undefined
    const salaryMax = values.salaryMax?.trim() ? Number(values.salaryMax) : undefined
    const applicationDeadline = values.applicationDeadline?.trim() || undefined
    const universityId = values.universityId?.trim() ? Number(values.universityId) : undefined

    return {
      title: values.title.trim(),
      description: values.description?.trim() ?? '',
      requirements: values.requirements?.trim() ?? '',
      jobType: values.jobType,
      workMode: values.workMode,
      experienceLevel: values.experienceLevel,
      location: values.workMode === 'REMOTE' ? '' : (values.location?.trim() ?? ''),
      salaryMin,
      salaryMax,
      clearSalary: salaryMin == null && salaryMax == null && hadSalary ? true : undefined,
      salaryCurrency: values.salaryCurrency.trim().toUpperCase(),
      applicationMode: values.applicationMode,
      externalApplyUrl:
        values.applicationMode === 'EXTERNAL' ? (values.externalApplyUrl?.trim() ?? '') : '',
      applicationDeadline,
      clearApplicationDeadline: applicationDeadline == null && hadDeadline ? true : undefined,
      universityId,
      clearUniversityId: universityId == null && hadUniversityId ? true : undefined,
    }
  }

  const busy = isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="job-title" className={LABEL_CLASS}>
          Job title <span className="text-red-500">*</span>
        </label>
        <input
          id="job-title"
          type="text"
          maxLength={JOB_TITLE_MAX}
          placeholder="Software Engineer Intern"
          className={inputClass(!!errors.title)}
          {...register('title')}
        />
        {errors.title && <p className={ERROR_CLASS}>{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="job-description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="job-description"
          rows={4}
          maxLength={JOB_DESCRIPTION_MAX}
          placeholder="What the role involves, the team, day-to-day responsibilities."
          className={inputClass(!!errors.description)}
          {...register('description')}
        />
        {errors.description && <p className={ERROR_CLASS}>{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="job-requirements" className={LABEL_CLASS}>
          Requirements
        </label>
        <textarea
          id="job-requirements"
          rows={4}
          maxLength={JOB_REQUIREMENTS_MAX}
          placeholder="Skills, qualifications, years of experience."
          className={inputClass(!!errors.requirements)}
          {...register('requirements')}
        />
        {errors.requirements && <p className={ERROR_CLASS}>{errors.requirements.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="job-type" className={LABEL_CLASS}>
            Job type
          </label>
          <select id="job-type" className={inputClass()} {...register('jobType')}>
            {JOB_TYPE_ORDER.map((type) => (
              <option key={type} value={type}>
                {JOB_TYPE_LABEL[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="job-workmode" className={LABEL_CLASS}>
            Work mode
          </label>
          <select
            id="job-workmode"
            className={inputClass()}
            value={workMode}
            onChange={(e) => handleWorkModeChange(e.target.value as (typeof WORK_MODE_ORDER)[number])}
          >
            {WORK_MODE_ORDER.map((mode) => (
              <option key={mode} value={mode}>
                {WORK_MODE_LABEL[mode]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="job-experience" className={LABEL_CLASS}>
            Experience level
          </label>
          <select id="job-experience" className={inputClass()} {...register('experienceLevel')}>
            {EXPERIENCE_LEVEL_ORDER.map((level) => (
              <option key={level} value={level}>
                {EXPERIENCE_LEVEL_LABEL[level]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <JobLocationField
        workMode={workMode}
        location={location}
        onLocationChange={(value) => setValue('location', value)}
        error={errors.location?.message}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="job-salary-min" className={LABEL_CLASS}>
            Minimum salary
          </label>
          <input
            id="job-salary-min"
            type="number"
            min={0}
            placeholder="Optional"
            className={inputClass(!!errors.salaryMin)}
            {...register('salaryMin')}
          />
        </div>
        <div>
          <label htmlFor="job-salary-max" className={LABEL_CLASS}>
            Maximum salary
          </label>
          <input
            id="job-salary-max"
            type="number"
            min={0}
            placeholder="Optional"
            className={inputClass(!!errors.salaryMax)}
            {...register('salaryMax')}
          />
          {errors.salaryMax && <p className={ERROR_CLASS}>{errors.salaryMax.message}</p>}
        </div>
        <div>
          <label htmlFor="job-currency" className={LABEL_CLASS}>
            Currency
          </label>
          <input
            id="job-currency"
            type="text"
            maxLength={3}
            className={inputClass(!!errors.salaryCurrency)}
            {...register('salaryCurrency', {
              onBlur: (e) => setValue('salaryCurrency', e.target.value.trim().toUpperCase()),
            })}
          />
          {errors.salaryCurrency && <p className={ERROR_CLASS}>{errors.salaryCurrency.message}</p>}
        </div>
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-gray-200 p-4 dark:border-[#2D1F4D]">
        <legend className="px-1.5 text-sm font-semibold text-gray-900 dark:text-white">
          How do people apply?
        </legend>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleApplicationModeChange('INTERNAL')}
            className={[
              'flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
              applicationMode === 'INTERNAL'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400',
            ].join(' ')}
          >
            Easy Apply (in UniSphere)
          </button>
          <button
            type="button"
            onClick={() => handleApplicationModeChange('EXTERNAL')}
            className={[
              'flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
              applicationMode === 'EXTERNAL'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400',
            ].join(' ')}
          >
            External link
          </button>
        </div>

        {applicationMode === 'EXTERNAL' ? (
          <div>
            <label htmlFor="job-external-url" className={LABEL_CLASS}>
              Application link <span className="text-red-500">*</span>
            </label>
            <input
              id="job-external-url"
              type="text"
              maxLength={JOB_EXTERNAL_URL_MAX}
              placeholder="https://careers.example.com/apply"
              className={inputClass(!!errors.externalApplyUrl)}
              {...register('externalApplyUrl')}
            />
            {errors.externalApplyUrl && <p className={ERROR_CLASS}>{errors.externalApplyUrl.message}</p>}
            {!errors.externalApplyUrl && (
              <p className={HINT_CLASS}>Applicants are sent here instead — nothing is tracked in-app.</p>
            )}
          </div>
        ) : (
          <p className={HINT_CLASS}>
            Applicants upload a résumé and an optional cover letter directly in UniSphere.
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor="job-deadline" className={LABEL_CLASS}>
          Application deadline
        </label>
        <input
          id="job-deadline"
          type="date"
          min={isEdit ? undefined : todayDateValue()}
          className={inputClass(!!errors.applicationDeadline)}
          {...register('applicationDeadline')}
        />
        {errors.applicationDeadline && <p className={ERROR_CLASS}>{errors.applicationDeadline.message}</p>}
        {!errors.applicationDeadline && <p className={HINT_CLASS}>Optional — leave blank if there's no cut-off.</p>}
      </div>

      <div>
        <label htmlFor="job-university" className={LABEL_CLASS}>
          University
        </label>
        <input
          id="job-university"
          type="number"
          min={1}
          placeholder="Leave blank to show this job to every university"
          className={inputClass(!!errors.universityId)}
          {...register('universityId')}
        />
        {errors.universityId && <p className={ERROR_CLASS}>{errors.universityId.message}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-[#2D1F4D]">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Create draft'}
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
            Saved as a draft — publish it from the job page when you&apos;re ready.
          </span>
        )}
      </div>
    </form>
  )
}
