import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { JobDetailHeader } from '../components/JobDetailHeader'
import { JobApplyPanel } from '../components/JobApplyPanel'
import { JobDetailTabs, type JobDetailTab } from '../components/JobDetailTabs'
import { JobManageTab } from '../components/JobManageTab'
import { JobErrorState } from '../components/JobStateBlocks'
import { JobDetailSkeleton } from '../components/JobSkeleton'
import { useJob } from '../hooks/useJobQueries'

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<JobDetailTab>('details')

  const numericId = Number(jobId ?? 0)
  const { data: job, isPending, isError, error, refetch } = useJob(numericId)

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

        {isPending && <JobDetailSkeleton />}

        {isError && (
          <JobErrorState
            icon={TriangleAlert}
            title="Couldn't load this job"
            error={error}
            onRetry={() => refetch()}
          />
        )}

        {job && (
          <div className="space-y-5">
            <JobDetailHeader job={job} />

            <JobDetailTabs active={tab} onChange={setTab} showManage={job.canModify} />

            {tab === 'details' && <JobApplyPanel job={job} />}

            {tab === 'manage' && job.canModify && <JobManageTab job={job} />}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
