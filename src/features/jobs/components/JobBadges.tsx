import {
  APPLICATION_MODE_LABEL,
  APPLICATION_STATUS_CHIP,
  APPLICATION_STATUS_LABEL,
  EXPERIENCE_LEVEL_CHIP,
  EXPERIENCE_LEVEL_LABEL,
  JOB_STATUS_CHIP,
  JOB_STATUS_LABEL,
  JOB_TYPE_CHIP,
  JOB_TYPE_LABEL,
  WORK_MODE_CHIP,
  WORK_MODE_LABEL,
} from '../utils/display'
import type {
  ExperienceLevel,
  JobApplicationMode,
  JobApplicationStatus,
  JobStatus,
  JobType,
  WorkMode,
} from '../types'

const CHIP = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold'

export function JobTypeBadge({ jobType }: Readonly<{ jobType: JobType }>) {
  return <span className={`${CHIP} ${JOB_TYPE_CHIP[jobType]}`}>{JOB_TYPE_LABEL[jobType]}</span>
}

export function WorkModeBadge({ workMode }: Readonly<{ workMode: WorkMode }>) {
  return <span className={`${CHIP} ${WORK_MODE_CHIP[workMode]}`}>{WORK_MODE_LABEL[workMode]}</span>
}

export function ExperienceLevelBadge({ level }: Readonly<{ level: ExperienceLevel }>) {
  return <span className={`${CHIP} ${EXPERIENCE_LEVEL_CHIP[level]}`}>{EXPERIENCE_LEVEL_LABEL[level]}</span>
}

export function JobStatusBadge({ status }: Readonly<{ status: JobStatus }>) {
  return <span className={`${CHIP} ${JOB_STATUS_CHIP[status]}`}>{JOB_STATUS_LABEL[status]}</span>
}

export function JobApplicationModeBadge({ mode }: Readonly<{ mode: JobApplicationMode }>) {
  return (
    <span className={`${CHIP} bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300`}>
      {APPLICATION_MODE_LABEL[mode]}
    </span>
  )
}

export function JobApplicationStatusBadge({ status }: Readonly<{ status: JobApplicationStatus }>) {
  return (
    <span className={`${CHIP} ${APPLICATION_STATUS_CHIP[status]}`}>{APPLICATION_STATUS_LABEL[status]}</span>
  )
}
