import type {
  ExperienceLevel,
  JobApplicationMode,
  JobApplicationStatus,
  JobStatus,
  JobType,
  WorkMode,
} from '../types'

/**
 * Label and chip-class maps for every Jobs union.
 *
 * Full `Record<Union, string>` rather than partial maps with a fallback, deliberately: adding a
 * member to one of these unions then becomes a compile error at every display site instead of a
 * silent blank chip in production. Same discipline as `events/utils/display.ts`.
 */

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
}

export const JOB_TYPE_CHIP: Record<JobType, string> = {
  FULL_TIME: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  PART_TIME: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  INTERNSHIP: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  CONTRACT: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  FREELANCE: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
}

export const JOB_TYPE_ORDER: JobType[] = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE']

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  ON_SITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
}

export const WORK_MODE_CHIP: Record<WorkMode, string> = {
  ON_SITE: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
  REMOTE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  HYBRID: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
}

export const WORK_MODE_ORDER: WorkMode[] = ['ON_SITE', 'REMOTE', 'HYBRID']

export const EXPERIENCE_LEVEL_LABEL: Record<ExperienceLevel, string> = {
  INTERNSHIP: 'Internship',
  ENTRY_LEVEL: 'Entry level',
  MID_LEVEL: 'Mid level',
  SENIOR_LEVEL: 'Senior level',
  MANAGER: 'Manager',
  EXECUTIVE: 'Executive',
}

export const EXPERIENCE_LEVEL_CHIP: Record<ExperienceLevel, string> = {
  INTERNSHIP: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  ENTRY_LEVEL: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  MID_LEVEL: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  SENIOR_LEVEL: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  MANAGER: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300',
  EXECUTIVE: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

export const EXPERIENCE_LEVEL_ORDER: ExperienceLevel[] = [
  'INTERNSHIP',
  'ENTRY_LEVEL',
  'MID_LEVEL',
  'SENIOR_LEVEL',
  'MANAGER',
  'EXECUTIVE',
]

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED: 'Closed',
  FILLED: 'Filled',
}

export const JOB_STATUS_CHIP: Record<JobStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
  OPEN: 'bg-primary-100 text-primary-700 dark:bg-primary/15 dark:text-primary-400',
  CLOSED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  FILLED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}

/** Only the statuses a client may pick from the detail page — the FSM table in `permissions.ts`. */
export const JOB_USER_STATUS_ORDER: Array<Extract<JobStatus, 'OPEN' | 'CLOSED' | 'FILLED'>> = [
  'OPEN',
  'CLOSED',
  'FILLED',
]

export const APPLICATION_MODE_LABEL: Record<JobApplicationMode, string> = {
  INTERNAL: 'Easy Apply',
  EXTERNAL: 'External link',
}

export const APPLICATION_STATUS_LABEL: Record<JobApplicationStatus, string> = {
  SUBMITTED: 'Submitted',
  REVIEWED: 'Reviewed',
  SHORTLISTED: 'Shortlisted',
  REJECTED: 'Rejected',
  HIRED: 'Hired',
  WITHDRAWN: 'Withdrawn',
}

export const APPLICATION_STATUS_CHIP: Record<JobApplicationStatus, string> = {
  SUBMITTED: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
  REVIEWED: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  SHORTLISTED: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  HIRED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  WITHDRAWN: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500',
}

/** The four decision targets an employer/ADMIN may pick — never DRAFT/SUBMITTED/WITHDRAWN. */
export const APPLICATION_DECISION_ORDER: Array<
  Extract<JobApplicationStatus, 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'>
> = ['REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED']

/** Formats a salary range using the job's own currency — omits whichever bound is unset. */
export function formatSalaryRange(
  min: number | null,
  max: number | null,
  currency: string,
): string | null {
  if (min == null && max == null) return null
  const fmt = (n: number) => n.toLocaleString('en-US')
  if (min != null && max != null) return `${currency} ${fmt(min)} – ${fmt(max)}`
  if (min != null) return `${currency} ${fmt(min)}+`
  return `Up to ${currency} ${fmt(max!)}`
}
