import { ProjectStatusActions } from './ProjectStatusActions'
import { ProjectRoleManager } from './ProjectRoleManager'
import { ProjectApplicantRoster } from './ProjectApplicantRoster'
import { ProjectMemberRoster } from './ProjectMemberRoster'
import type { ProjectResponse } from '../types'

/**
 * Owner/ADMIN console: status + recruiting controls, role management, the applicant roster, then
 * the team roster. A single stacked section rather than sub-tabbed, same as `JobManageTab` — the
 * content volume here doesn't justify a second tab layer.
 */
export function ProjectManageTab({ project }: Readonly<{ project: ProjectResponse }>) {
  return (
    <div className="space-y-5">
      <ProjectStatusActions project={project} />
      <ProjectRoleManager projectId={project.id} />
      <ProjectApplicantRoster projectId={project.id} roles={project.roles} />
      <ProjectMemberRoster project={project} />
    </div>
  )
}
