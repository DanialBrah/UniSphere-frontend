import { z } from 'zod'
import type { ExperienceLevel, JobApplicationMode, JobType, WorkMode } from '../types'

// Limits mirror the Java bean-validation constraints so the client rejects what the server would.
export const JOB_TITLE_MAX = 255
export const JOB_DESCRIPTION_MAX = 5000
export const JOB_REQUIREMENTS_MAX = 5000
export const JOB_LOCATION_MAX = 255
export const JOB_EXTERNAL_URL_MAX = 500
export const JOB_CURRENCY_LENGTH = 3
export const JOB_APPLICATION_REASON_MAX = 255
export const JOB_COVER_LETTER_MAX = 5000

const JOB_TYPE_VALUES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE'] as const
const WORK_MODE_VALUES = ['ON_SITE', 'REMOTE', 'HYBRID'] as const
const EXPERIENCE_LEVEL_VALUES = [
  'INTERNSHIP',
  'ENTRY_LEVEL',
  'MID_LEVEL',
  'SENIOR_LEVEL',
  'MANAGER',
  'EXECUTIVE',
] as const

/**
 * Salary and the deadline travel through the form as strings — an empty number/date input yields
 * '', and RHF has no way to express "absent" on those controls without it becoming NaN/invalid.
 * They're parsed once at submit, so the schema validates the string form.
 */
const numericString = z.string().optional().or(z.literal(''))

const jobFormShape = {
  title: z
    .string()
    .trim()
    .min(1, 'Give the job a title')
    .max(JOB_TITLE_MAX, `Title must not exceed ${JOB_TITLE_MAX} characters`),
  description: z
    .string()
    .max(JOB_DESCRIPTION_MAX, `Description must not exceed ${JOB_DESCRIPTION_MAX} characters`)
    .optional()
    .or(z.literal('')),
  requirements: z
    .string()
    .max(JOB_REQUIREMENTS_MAX, `Requirements must not exceed ${JOB_REQUIREMENTS_MAX} characters`)
    .optional()
    .or(z.literal('')),
  jobType: z.enum(JOB_TYPE_VALUES),
  workMode: z.enum(WORK_MODE_VALUES),
  experienceLevel: z.enum(EXPERIENCE_LEVEL_VALUES),
  location: z
    .string()
    .max(JOB_LOCATION_MAX, `Location must not exceed ${JOB_LOCATION_MAX} characters`)
    .optional()
    .or(z.literal('')),
  salaryMin: numericString,
  salaryMax: numericString,
  salaryCurrency: z
    .string()
    .trim()
    .length(JOB_CURRENCY_LENGTH, `Currency must be a ${JOB_CURRENCY_LENGTH}-letter code, e.g. MYR`),
  applicationMode: z.enum(['INTERNAL', 'EXTERNAL']),
  externalApplyUrl: z
    .string()
    .max(JOB_EXTERNAL_URL_MAX, `Link must not exceed ${JOB_EXTERNAL_URL_MAX} characters`)
    .optional()
    .or(z.literal('')),
  applicationDeadline: numericString,
  universityId: numericString,
}

/**
 * A schema factory, not a single constant — the one structural divergence from `eventFormSchema`.
 * `applicationDeadline` must be a future date, but only `JobService`'s CREATE path enforces that;
 * UpdateJobRequest has no such rule. Everything else (rules 1-4 below) is identical between the
 * two variants.
 */
export function buildJobFormSchema(isEdit: boolean) {
  return z.object(jobFormShape).superRefine((value, ctx) => {
    // Rule 1 — REMOTE forbids a location; ON_SITE/HYBRID require one.
    if (value.workMode === 'REMOTE' && value.location?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['location'],
        message: 'Remote roles have no location — clear this or switch work mode.',
      })
    }
    if (value.workMode !== 'REMOTE' && !value.location?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['location'],
        message: 'Add a location, or switch to Remote.',
      })
    }

    // Rule 2/3 — applicationMode <-> externalApplyUrl, both directions.
    if (value.applicationMode === 'EXTERNAL') {
      if (!value.externalApplyUrl?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['externalApplyUrl'],
          message: 'Add the link applicants should apply at.',
        })
      }
    } else if (value.externalApplyUrl?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['externalApplyUrl'],
        message: 'Only used for external applications — clear this or switch application mode.',
      })
    }

    // Rule 4 — salaryMin <= salaryMax when both are present.
    const min = value.salaryMin?.trim() ? Number(value.salaryMin) : null
    const max = value.salaryMax?.trim() ? Number(value.salaryMax) : null
    if (min != null && max != null && min > max) {
      ctx.addIssue({
        code: 'custom',
        path: ['salaryMax'],
        message: 'Maximum salary must be at least the minimum.',
      })
    }

    // Rule 5 — future deadline, create only. Mirrors JobService: only enforced on create.
    if (!isEdit && value.applicationDeadline?.trim()) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadline = new Date(`${value.applicationDeadline}T00:00:00`)
      if (deadline.getTime() <= today.getTime()) {
        ctx.addIssue({
          code: 'custom',
          path: ['applicationDeadline'],
          message: 'The application deadline must be in the future.',
        })
      }
    }
  })
}

/**
 * Explicit interface, NOT z.infer<> — @hookform/resolvers v5 + Zod v4 infers `unknown` for fields
 * on a schema that uses refinements, which this one does. Same rule as every other feature's
 * schema file in this repo.
 */
export interface JobFormData {
  title: string
  description?: string
  requirements?: string
  jobType: JobType
  workMode: WorkMode
  experienceLevel: ExperienceLevel
  location?: string
  salaryMin?: string
  salaryMax?: string
  salaryCurrency: string
  applicationMode: JobApplicationMode
  externalApplyUrl?: string
  applicationDeadline?: string
  universityId?: string
}

export const jobApplicationSchema = z.object({
  coverLetter: z
    .string()
    .max(JOB_COVER_LETTER_MAX, `Cover letter must not exceed ${JOB_COVER_LETTER_MAX} characters`)
    .optional()
    .or(z.literal('')),
})

export interface JobApplicationFormData {
  coverLetter?: string
}
