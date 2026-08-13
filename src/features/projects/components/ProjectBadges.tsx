import {
  APPLICATION_STATUS_CHIP,
  APPLICATION_STATUS_LABEL,
  PROJECT_ROLE_STATUS_CHIP,
  PROJECT_ROLE_STATUS_LABEL,
  PROJECT_STATUS_CHIP,
  PROJECT_STATUS_LABEL,
} from '../utils/display'
import type { ProjectApplicationStatus, ProjectRoleStatus, ProjectStatus } from '../types'

const CHIP = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold'

export function ProjectStatusBadge({ status }: Readonly<{ status: ProjectStatus }>) {
  return <span className={`${CHIP} ${PROJECT_STATUS_CHIP[status]}`}>{PROJECT_STATUS_LABEL[status]}</span>
}

export function ProjectRoleStatusBadge({ status }: Readonly<{ status: ProjectRoleStatus }>) {
  return <span className={`${CHIP} ${PROJECT_ROLE_STATUS_CHIP[status]}`}>{PROJECT_ROLE_STATUS_LABEL[status]}</span>
}

export function ProjectApplicationStatusBadge({ status }: Readonly<{ status: ProjectApplicationStatus }>) {
  return <span className={`${CHIP} ${APPLICATION_STATUS_CHIP[status]}`}>{APPLICATION_STATUS_LABEL[status]}</span>
}

export function ProjectRecruitingBadge() {
  return (
    <span className={`${CHIP} bg-primary-100 text-primary-700 dark:bg-primary/15 dark:text-primary-400`}>
      Recruiting
    </span>
  )
}
