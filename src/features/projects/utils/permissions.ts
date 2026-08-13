import type { UserProfileResponse } from '../../identity/types/auth'
import type {
  ProjectApplicationStatus,
  ProjectResponse,
  ProjectRoleResponse,
  ProjectStatus,
} from '../types'

/**
 * UI mirroring only. Every rule here is enforced independently by `ProjectAccessService` and
 * `ProjectService`/`ProjectApplicationService` server-side; these predicates exist to avoid showing
 * a control that would fail, not to authorise anything. A stale token or a role change makes the
 * client's view wrong, so never treat a passing check as permission.
 */

/** STUDENT/ALUMNI/CLUB only — broader than Jobs (EMPLOYER-only), narrower than Events (anyone). */
export function canCreateProject(user: UserProfileResponse | null | undefined): boolean {
  return user?.role === 'STUDENT' || user?.role === 'ALUMNI' || user?.role === 'CLUB'
}

/**
 * The server also sends `canModify` on every project, computed from the same rule. Prefer that when
 * it's available; this exists for the places holding only a user and an owner id.
 */
export function canModifyProject(
  user: UserProfileResponse | null | undefined,
  project: { owner: { id: number } },
): boolean {
  if (!user) return false
  return user.id === project.owner.id || user.role === 'ADMIN'
}

/**
 * Applying is open to STUDENT/ALUMNI only, on a specific open role: the project isn't COMPLETED and
 * is recruiting, the role is OPEN with a free slot, the viewer isn't the owner, and — unlike Jobs,
 * which exposes `viewerApplicationStatus` on the job itself — whether the viewer already applied to
 * *this role* has to be tracked separately (see `useMyApplicationsForProject`), since a project has
 * many roles and a viewer's status is per-role, not per-project.
 */
export function canApplyToProjectRole(
  user: UserProfileResponse | null | undefined,
  project: ProjectResponse,
  role: ProjectRoleResponse,
  hasExistingApplication: boolean,
): boolean {
  if (!user) return false
  if (user.role !== 'STUDENT' && user.role !== 'ALUMNI') return false
  if (project.owner.id === user.id) return false
  if (project.status === 'COMPLETED') return false
  if (!project.isRecruiting) return false
  if (role.status !== 'OPEN' || role.filledCount >= role.slots) return false
  return !hasExistingApplication
}

/** Only the applicant themselves, and only while the application hasn't reached a terminal state. */
export function canWithdrawApplication(
  user: UserProfileResponse | null | undefined,
  application: { applicantId: number; status: ProjectApplicationStatus },
): boolean {
  if (!user || user.id !== application.applicantId) return false
  return application.status === 'PENDING'
}

/** The project's owner or an ADMIN, on a still-pending application. */
export function canDecideApplication(
  user: UserProfileResponse | null | undefined,
  project: { owner: { id: number } },
  application: { status: ProjectApplicationStatus },
): boolean {
  if (!user) return false
  if (user.id !== project.owner.id && user.role !== 'ADMIN') return false
  return application.status === 'PENDING'
}

/** Any member other than the owner, on their own row. */
export function canLeaveProject(
  user: UserProfileResponse | null | undefined,
  memberRole: 'OWNER' | 'CONTRIBUTOR' | undefined,
): boolean {
  return !!user && memberRole === 'CONTRIBUTOR'
}

/** Owner/ADMIN, never the owner's own row. */
export function canRemoveMember(
  user: UserProfileResponse | null | undefined,
  project: { owner: { id: number } },
  targetUserId: number,
): boolean {
  if (!user) return false
  if (user.id !== project.owner.id && user.role !== 'ADMIN') return false
  return targetUserId !== project.owner.id
}

/**
 * The status transitions a user may actually pick, mirroring the FSM in `ProjectService.changeStatus`.
 * COMPLETED never appears with a way back out — it's terminal.
 */
export function allowedProjectStatusTargets(status: ProjectStatus): readonly ProjectStatus[] {
  switch (status) {
    case 'OPEN':
      return ['IN_PROGRESS', 'COMPLETED']
    case 'IN_PROGRESS':
      return ['OPEN', 'COMPLETED']
    case 'COMPLETED':
      return []
  }
}

export function isTerminalProjectStatus(status: ProjectStatus): boolean {
  return status === 'COMPLETED'
}

/** Deleting is blocked server-side (400) while the project has any member besides the owner. */
export function hasOtherMembers(project: { memberCount: number }): boolean {
  return project.memberCount > 1
}
