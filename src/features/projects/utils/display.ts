import type { ProjectApplicationStatus, ProjectRoleStatus, ProjectStatus } from '../types'

/**
 * Label and chip-class maps for every Projects union.
 *
 * Full `Record<Union, string>` rather than partial maps with a fallback, deliberately: adding a
 * member to one of these unions then becomes a compile error at every display site instead of a
 * silent blank chip in production. Same discipline as `jobs/utils/display.ts`.
 */

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
}

export const PROJECT_STATUS_CHIP: Record<ProjectStatus, string> = {
  OPEN: 'bg-primary-100 text-primary-700 dark:bg-primary/15 dark:text-primary-400',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}

/** Every status a client may pick from the detail page — the FSM table in `permissions.ts`. */
export const PROJECT_STATUS_ORDER: ProjectStatus[] = ['OPEN', 'IN_PROGRESS', 'COMPLETED']

export const PROJECT_ROLE_STATUS_LABEL: Record<ProjectRoleStatus, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
}

export const PROJECT_ROLE_STATUS_CHIP: Record<ProjectRoleStatus, string> = {
  OPEN: 'bg-primary-100 text-primary-700 dark:bg-primary/15 dark:text-primary-400',
  CLOSED: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
}

export const APPLICATION_STATUS_LABEL: Record<ProjectApplicationStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

export const APPLICATION_STATUS_CHIP: Record<ProjectApplicationStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
  ACCEPTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  WITHDRAWN: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500',
}

/** The two decision targets an owner/ADMIN may pick — never PENDING/WITHDRAWN. */
export const APPLICATION_DECISION_ORDER: Array<Extract<ProjectApplicationStatus, 'ACCEPTED' | 'REJECTED'>> = [
  'ACCEPTED',
  'REJECTED',
]
