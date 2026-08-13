import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { ProjectDetailHeader } from '../components/ProjectDetailHeader'
import { ProjectRolesList } from '../components/ProjectRolesList'
import { ProjectDetailTabs, type ProjectDetailTab } from '../components/ProjectDetailTabs'
import { ProjectManageTab } from '../components/ProjectManageTab'
import { ProjectErrorState } from '../components/ProjectStateBlocks'
import { ProjectDetailSkeleton } from '../components/ProjectSkeleton'
import { useProject } from '../hooks/useProjectQueries'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ProjectDetailTab>('details')

  const numericId = Number(projectId ?? 0)
  const { data: project, isPending, isError, error, refetch } = useProject(numericId)

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

        {isPending && <ProjectDetailSkeleton />}

        {isError && (
          <ProjectErrorState
            icon={TriangleAlert}
            title="Couldn't load this project"
            error={error}
            onRetry={() => refetch()}
          />
        )}

        {project && (
          <div className="space-y-5">
            <ProjectDetailHeader project={project} />

            <ProjectDetailTabs active={tab} onChange={setTab} showManage={project.canModify} />

            {tab === 'details' && <ProjectRolesList project={project} />}

            {tab === 'manage' && project.canModify && <ProjectManageTab project={project} />}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
