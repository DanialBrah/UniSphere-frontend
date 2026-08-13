import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { jobApi } from '../api/jobApi'
import { jobErrorMessage } from '../utils/jobErrors'
import { JOB_STATUS_LABEL } from '../utils/display'
import { jobKeys } from '../types'
import type { CreateJobRequest, JobResponse, JobStatusUpdateRequest, UpdateJobRequest } from '../types'

/** Every list surface that could contain the changed job. */
function invalidateJobLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
  queryClient.invalidateQueries({ queryKey: jobKeys.searches() })
  queryClient.invalidateQueries({ queryKey: jobKeys.mineAll() })
}

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateJobRequest) => jobApi.create(body),
    onSuccess: (job: JobResponse) => {
      queryClient.setQueryData(jobKeys.detail(job.id), job)
      invalidateJobLists(queryClient)
      toast.success("Job posted as a draft — publish it when you're ready")
    },
    onError: (err) => toast.error(jobErrorMessage(err)),
  })
}

export function useUpdateJob(jobId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateJobRequest) => jobApi.update(jobId, body),
    onSuccess: (job: JobResponse) => {
      queryClient.setQueryData(jobKeys.detail(job.id), job)
      invalidateJobLists(queryClient)
      toast.success('Job posting updated')
    },
    onError: (err) => toast.error(jobErrorMessage(err)),
  })
}

export function useChangeJobStatus(jobId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: JobStatusUpdateRequest) => jobApi.changeStatus(jobId, body),
    onSuccess: (job: JobResponse) => {
      queryClient.setQueryData(jobKeys.detail(job.id), job)
      invalidateJobLists(queryClient)
      toast.success(
        job.status === 'CLOSED' || job.status === 'FILLED'
          ? `Job ${JOB_STATUS_LABEL[job.status].toLowerCase()} — every in-pipeline applicant was notified`
          : `Job ${JOB_STATUS_LABEL[job.status].toLowerCase()}`,
      )
    },
    onError: (err) => toast.error(jobErrorMessage(err)),
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: number) => jobApi.remove(jobId),
    onSuccess: (_data, jobId) => {
      // Removed rather than invalidated: the row is soft-deleted server-side, so a refetch of this
      // key would 404 and leave an error state cached behind the redirect.
      queryClient.removeQueries({ queryKey: jobKeys.detail(jobId) })
      queryClient.removeQueries({ queryKey: jobKeys.stats(jobId) })
      queryClient.removeQueries({ queryKey: jobKeys.rosterAll(jobId) })
      invalidateJobLists(queryClient)
      toast.success('Job posting deleted')
    },
    onError: (err) => toast.error(jobErrorMessage(err)),
  })
}
