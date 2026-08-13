import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, TriangleAlert } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { PageSpinner } from '../../../components/ui/PageSpinner'
import { JobForm } from '../components/JobForm'
import { JobErrorState, JobStateBlock } from '../components/JobStateBlocks'
import { useJob } from '../hooks/useJobQueries'
import { useCreateJob, useUpdateJob } from '../hooks/useJobMutations'
import { canCreateJob, isTerminalJobStatus } from '../utils/permissions'
import { useAuth } from '../../../hooks/useAuth'

/**
 * Create and edit in one page.
 *
 * `/jobs/new` and `/jobs/:jobId/edit` both land here; the presence of `jobId` is what switches
 * modes. React Router v7 ranks by specificity, so the static `new` segment wins over `:jobId`
 * regardless of declaration order.
 */
export default function JobFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { jobId } = useParams<{ jobId: string }>()
  const numericId = Number(jobId ?? 0)
  const isEdit = numericId > 0

  const jobQuery = useJob(numericId, { enabled: isEdit })
  const createMutation = useCreateJob()
  const updateMutation = useUpdateJob(numericId)

  // Posting is EMPLOYER-only — a new gate relative to Events, which has no creation-time role
  // check at all. Edit-mode needs no separate check: the canModify guard below already turns away
  // any non-owner, including a non-EMPLOYER.
  if (!isEdit && !canCreateJob(user)) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <JobStateBlock
            icon={Lock}
            title="Only employers can post jobs"
            hint="Sign in with an employer account to create a job posting."
            actionLabel="Back to jobs"
            onAction={() => navigate('/jobs')}
          />
        </div>
      </DashboardLayout>
    )
  }

  if (isEdit && jobQuery.isPending) return <PageSpinner />

  if (isEdit && jobQuery.isError) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <JobErrorState
            icon={TriangleAlert}
            title="Couldn't load this job"
            error={jobQuery.error}
            onRetry={() => jobQuery.refetch()}
          />
        </div>
      </DashboardLayout>
    )
  }

  const existing = isEdit ? jobQuery.data : undefined

  // `canModify` is computed server-side from the same rule the API enforces, so it's the honest
  // gate here — mirroring the check locally would only add a second place to get it wrong.
  if (existing && !existing.canModify) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <JobStateBlock
            icon={Lock}
            title="You can't edit this job"
            hint="Only the posting employer can change it."
            actionLabel="Back to the job"
            onAction={() => navigate(`/jobs/${numericId}`)}
          />
        </div>
      </DashboardLayout>
    )
  }

  if (existing && isTerminalJobStatus(existing.status)) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
          <JobStateBlock
            icon={Lock}
            title="This job is closed"
            hint="Closed and filled postings are kept as a record and can no longer be edited."
            actionLabel="Back to the job"
            onAction={() => navigate(`/jobs/${numericId}`)}
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

        <header className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit job posting' : 'Post a job'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {isEdit
              ? 'Update the details — applicants see the changes immediately.'
              : "Saved as a draft first. Publish it when you're ready for people to see it."}
          </p>
        </header>

        <JobForm
          existing={existing}
          onCreate={(body) => createMutation.mutateAsync(body)}
          onUpdate={(body) => updateMutation.mutateAsync(body)}
          onDone={(job) => navigate(`/jobs/${job.id}`, { replace: true })}
          onCancel={() => navigate(-1)}
        />
      </div>
    </DashboardLayout>
  )
}
