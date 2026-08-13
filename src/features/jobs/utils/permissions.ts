import type { UserProfileResponse } from '../../identity/types/auth'
import type { JobApplicationStatus, JobResponse, JobStatus } from '../types'

/**
 * UI mirroring only. Every rule here is enforced independently by `JobAccessService` and
 * `JobService`/`JobApplicationService` server-side; these predicates exist to avoid showing a
 * control that would fail, not to authorise anything. A stale token or a role change makes the
 * client's view wrong, so never treat a passing check as permission.
 */

/** EMPLOYER only — new relative to Events, which has no creation-time role gate at all. */
export function canCreateJob(user: UserProfileResponse | null | undefined): boolean {
  return user?.role === 'EMPLOYER'
}

/**
 * The server also sends `canModify` on every job, computed from the same rule. Prefer that when
 * it's available; this exists for the places holding only a user and an employer id.
 */
export function canModifyJob(
  user: UserProfileResponse | null | undefined,
  job: { employer: { employerId: number } },
): boolean {
  if (!user) return false
  return user.id === job.employer.employerId || user.role === 'ADMIN'
}

/**
 * Applying is open to STUDENT/ALUMNI only, while the job is OPEN and INTERNAL (Easy Apply), the
 * viewer isn't the poster, and they have no existing application. EXTERNAL jobs never reach this —
 * they're always a plain outbound link, so there's nothing for this predicate to gate.
 */
export function canApplyToJob(user: UserProfileResponse | null | undefined, job: JobResponse): boolean {
  if (!user) return false
  if (user.role !== 'STUDENT' && user.role !== 'ALUMNI') return false
  if (job.employer.employerId === user.id) return false
  if (job.applicationMode !== 'INTERNAL') return false
  if (job.status !== 'OPEN') return false
  return job.viewerApplicationStatus == null
}

/** Only the applicant themselves, and only while the application hasn't reached a terminal state. */
export function canWithdrawApplication(
  user: UserProfileResponse | null | undefined,
  application: { applicantId: number; status: JobApplicationStatus },
): boolean {
  if (!user || user.id !== application.applicantId) return false
  return (['SUBMITTED', 'REVIEWED', 'SHORTLISTED'] as JobApplicationStatus[]).includes(application.status)
}

/** The job's owning employer or an ADMIN, on a non-terminal application. */
export function canDecideApplication(
  user: UserProfileResponse | null | undefined,
  job: { employer: { employerId: number } },
  application: { status: JobApplicationStatus },
): boolean {
  if (!user) return false
  if (user.id !== job.employer.employerId && user.role !== 'ADMIN') return false
  return (['SUBMITTED', 'REVIEWED', 'SHORTLISTED'] as JobApplicationStatus[]).includes(application.status)
}

/**
 * The status transitions a user may actually pick, mirroring the FSM in `JobService.changeStatus`.
 * DRAFT never appears as a target — it's only the starting state.
 */
export function allowedJobStatusTargets(status: JobStatus): readonly Extract<JobStatus, 'OPEN' | 'CLOSED' | 'FILLED'>[] {
  switch (status) {
    case 'DRAFT':
      return ['OPEN', 'CLOSED']
    case 'OPEN':
      return ['CLOSED', 'FILLED']
    case 'CLOSED':
    case 'FILLED':
      return []
  }
}

export function isTerminalJobStatus(status: JobStatus): boolean {
  return status === 'CLOSED' || status === 'FILLED'
}

/**
 * The decision targets an employer/ADMIN may pick for one application, mirroring
 * `JobApplicationService.decide`'s FSM. Empty once the application has reached a terminal state.
 */
export function allowedApplicationDecisionTargets(
  status: JobApplicationStatus,
): readonly Extract<JobApplicationStatus, 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'>[] {
  if (isTerminalApplicationStatus(status)) return []
  const all: Extract<JobApplicationStatus, 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'>[] = [
    'REVIEWED',
    'SHORTLISTED',
    'REJECTED',
    'HIRED',
  ]
  return all.filter((target) => target !== status)
}

export function isTerminalApplicationStatus(status: JobApplicationStatus): boolean {
  return status === 'REJECTED' || status === 'HIRED' || status === 'WITHDRAWN'
}

/** Deleting is blocked server-side (400) while the posting has any application on record. */
export function hasApplications(job: { applicationCount: number }): boolean {
  return job.applicationCount > 0
}
