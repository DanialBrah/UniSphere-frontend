import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { PageSpinner } from '../../../components/ui/PageSpinner'
import { ProjectForm } from '../components/ProjectForm'
import { ProjectErrorState, ProjectStateBlock } from '../components/ProjectStateBlocks'
import { useProject } from '../hooks/useProjectQueries'
import { useCreateProject, useUpdateProject } from '../hooks/useProjectMutations'
import { useAuth } from '../../../hooks/useAuth'
import { canCreateProject } from '../utils/permissions'

/**
 * Create and edit in one page. `/projects/new` and `/projects/:projectId/edit` both land here; the
 * presence of `projectId` is what switches modes — same pattern as `JobFormPage`/`LostFoundReportPage`.
 */
export default function ProjectFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { projectId } = useParams<{ projectId: string }>()
  const numericId = Number(projectId ?? 0)
  const isEdit = numericId > 0

  const projectQuery = useProject(numericId, { enabled: isEdit })
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject(numericId)

  if (!isEdit && !canCreateProject(user)) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <ProjectStateBlock
            icon={Lock}
            title="You can't showcase a project"
            hint="Only students, alumni and clubs can create a project."
            actionLabel="Back to projects"
            onAction={() => navigate('/projects')}
          />
        </div>
      </DashboardLayout>
    )
  }

  if (isEdit && projectQuery.isPending) return <PageSpinner />

  if (isEdit && projectQuery.isError) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <ProjectErrorState
            icon={TriangleAlert}
            title="Couldn't load this project"
            error={projectQuery.error}
            onRetry={() => projectQuery.refetch()}
          />
        </div>
      </DashboardLayout>
    )
  }

  const existing = isEdit ? projectQuery.data : undefined

  // `canModify` is computed server-side from the same rule the API enforces, so it's the honest
  // gate here — mirroring the check locally would only add a second place to get it wrong.
  if (existing && !existing.canModify) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <ProjectStateBlock
            icon={Lock}
            title="You can't edit this project"
            hint="Only the project's owner can change it."
            actionLabel="Back to the project"
            onAction={() => navigate(`/projects/${numericId}`)}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit project' : 'Showcase a project'}
        </h1>

        <ProjectForm
          existing={existing}
          onCreate={isEdit ? undefined : (body) => createMutation.mutateAsync(body)}
          onUpdate={isEdit ? (body) => updateMutation.mutateAsync(body) : undefined}
          onDone={(project) => navigate(`/projects/${project.id}`)}
          onCancel={() => navigate(-1)}
        />
      </div>
    </DashboardLayout>
  )
}
