import { useState } from 'react'
import { Info, Loader2, Users2 } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { ProjectApplyModal } from './ProjectApplyModal'
import { ProjectApplicationStatusBadge, ProjectRoleStatusBadge } from './ProjectBadges'
import { useAuth } from '../../../hooks/useAuth'
import { useMyApplicationsForProject, useWithdrawProjectApplication } from '../hooks/useProjectApplications'
import { useUpdateProject } from '../hooks/useProjectMutations'
import { canApplyToProjectRole, canWithdrawApplication } from '../utils/permissions'
import type { ProjectResponse, ProjectRoleResponse } from '../types'

/**
 * The project's open roles, shown on the Details tab. Unlike Jobs' single job-level
 * `viewerApplicationStatus`, a project has many roles and the viewer's application status is
 * per-role — `useMyApplicationsForProject` resolves that once for the whole list.
 */
export function ProjectRolesList({ project }: Readonly<{ project: ProjectResponse }>) {
  const { user, role: viewerRole } = useAuth()
  const [applyTarget, setApplyTarget] = useState<ProjectRoleResponse | null>(null)
  const [withdrawTarget, setWithdrawTarget] = useState<number | null>(null)
  const isOwner = user?.id === project.owner.id
  const canEverApply = !!user && (viewerRole === 'STUDENT' || viewerRole === 'ALUMNI') && !isOwner

  const { byRoleId } = useMyApplicationsForProject(project.id, canEverApply)
  const withdrawMutation = useWithdrawProjectApplication(project.id)
  const updateProject = useUpdateProject(project.id)

  if (project.roles.length === 0) {
    return (
      <p className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400">
        This project hasn't listed any open roles yet.
      </p>
    )
  }

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        <Users2 className="h-4 w-4 text-primary" />
        Open roles
      </h2>

      {/*
        `isRecruiting` defaults to false on every new project — nobody can apply until the owner
        explicitly switches it on. Without this notice, an eligible visitor sees roles listed with
        no Apply button anywhere and no way to tell why, which reads as a bug rather than a state.
      */}
      {!project.isRecruiting && project.status !== 'COMPLETED' && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <Info className="h-4 w-4 shrink-0" />
          {isOwner ? (
            <>
              <span className="flex-1">Recruiting is off, so no one can apply yet.</span>
              <button
                type="button"
                onClick={() => updateProject.mutate({ isRecruiting: true })}
                disabled={updateProject.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1 font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
              >
                {updateProject.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                Start recruiting
              </button>
            </>
          ) : (
            <span>This project isn&apos;t recruiting right now — check back later.</span>
          )}
        </div>
      )}

      <div className="space-y-2.5">
        {project.roles.map((projectRole) => {
          const application = byRoleId.get(projectRole.id)
          const canApply =
            canEverApply && !application && canApplyToProjectRole(user, project, projectRole, false)
          const canWithdraw = application ? canWithdrawApplication(user, application) : false

          return (
            <div
              key={projectRole.id}
              className="space-y-2 rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-[#2D1F4D] dark:bg-[#1A1226]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{projectRole.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {projectRole.filledCount}/{projectRole.slots} filled
                  </p>
                </div>
                <ProjectRoleStatusBadge status={projectRole.status} />
              </div>

              {projectRole.description && (
                <p className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300">
                  {projectRole.description}
                </p>
              )}

              {application ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 dark:border-white/5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">You applied —</span>
                  <ProjectApplicationStatusBadge status={application.status} />
                  {canWithdraw && (
                    <button
                      type="button"
                      onClick={() => setWithdrawTarget(application.id)}
                      className="ml-auto text-xs font-medium text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              ) : (
                canApply && (
                  <button
                    type="button"
                    onClick={() => setApplyTarget(projectRole)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    Apply to this role
                  </button>
                )
              )}
            </div>
          )
        })}
      </div>

      {applyTarget && (
        <ProjectApplyModal
          projectId={project.id}
          roleId={applyTarget.id}
          roleTitle={applyTarget.title}
          onClose={() => setApplyTarget(null)}
        />
      )}

      {withdrawTarget != null && (
        <ConfirmModal
          title="Withdraw your application?"
          body="The project owner will no longer see you as an active applicant. This cannot be undone."
          confirmLabel="Withdraw"
          destructive
          isPending={withdrawMutation.isPending}
          onConfirm={() => withdrawMutation.mutate(withdrawTarget, { onSuccess: () => setWithdrawTarget(null) })}
          onCancel={() => setWithdrawTarget(null)}
        />
      )}
    </section>
  )
}
