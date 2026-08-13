import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { jobApplicationApi } from '../api/jobApplicationApi'
import { jobMediaApi } from '../api/jobMediaApi'
import { jobErrorMessage } from '../utils/jobErrors'
import { jobKeys } from '../types'
import type { JobApplicationResponse, JobApplicationStatus, SpringPage } from '../types'

function nextPage(lastPage: SpringPage<JobApplicationResponse>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/** Apply/decide/withdraw all touch applicationCount and viewer status, so every derived surface refreshes. */
function invalidateAfterApplicationChange(queryClient: QueryClient, jobId: number) {
  queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) })
  queryClient.invalidateQueries({ queryKey: jobKeys.stats(jobId) })
  queryClient.invalidateQueries({ queryKey: jobKeys.rosterAll(jobId) })
  queryClient.invalidateQueries({ queryKey: jobKeys.myApplication(jobId) })
  queryClient.invalidateQueries({ queryKey: jobKeys.myApplicationsAll() })
  queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
}

// ── Reads ────────────────────────────────────────────────────────────────────

/** Applicant roster for one job. Owner/ADMIN only — gate `enabled` on `job.canModify`. */
export function useJobApplicationRoster(jobId: number, status: JobApplicationStatus | null, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: jobKeys.roster(jobId, status ?? 'ALL'),
    queryFn: ({ pageParam }) => jobApplicationApi.listRoster(jobId, status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: enabled && jobId > 0,
  })
}

/**
 * The caller's own application for one job. Only enabled when `job.viewerApplicationStatus` is
 * already non-null, to avoid a guaranteed 404 in the (common) never-applied case.
 */
export function useMyJobApplication(jobId: number, enabled: boolean) {
  return useQuery({
    queryKey: jobKeys.myApplication(jobId),
    queryFn: () => jobApplicationApi.getMyApplication(jobId),
    enabled: enabled && jobId > 0,
    retry: false,
  })
}

/** "My applications" across every job. */
export function useMyJobApplications(status: JobApplicationStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: jobKeys.myApplications(status ?? 'ALL'),
    queryFn: ({ pageParam }) => jobApplicationApi.listMyApplications(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
  })
}

// ── Writes ───────────────────────────────────────────────────────────────────

interface ApplyVariables {
  file: File
  coverLetter?: string
}

/**
 * Easy Apply — uploads the résumé, then submits the application with the resulting key. The upload
 * happens here, at submit time, not when the file is picked: a presigned PUT URL expires after
 * about five minutes, comfortably longer than a two-field modal takes to fill in, same reasoning as
 * event cover images.
 */
export function useApplyToJob(jobId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, coverLetter }: ApplyVariables) => {
      const { mediaKey } = await jobMediaApi.upload(file)
      return jobApplicationApi.apply(jobId, { resumeKey: mediaKey, coverLetter: coverLetter?.trim() || undefined })
    },
    onSuccess: (application: JobApplicationResponse) => {
      queryClient.setQueryData(jobKeys.myApplication(jobId), application)
      invalidateAfterApplicationChange(queryClient, jobId)
      toast.success('Application submitted')
    },
    onError: (err) => {
      // An upload-stage failure (a plain Error thrown by fetch, not an AxiosError) reads better
      // with its own copy than the generic API-error fallback jobErrorMessage would give it.
      if (err instanceof Error && err.message.toLowerCase().includes('upload')) {
        toast.error("The résumé upload didn't go through. Please try again.")
        return
      }
      toast.error(jobErrorMessage(err))
    },
  })
}

/** The applicant withdrawing their own application — no reason UI, unlike an employer decision. */
export function useWithdrawJobApplication(jobId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: number) => jobApplicationApi.decide(applicationId, 'WITHDRAWN'),
    onSuccess: (application: JobApplicationResponse) => {
      queryClient.setQueryData(jobKeys.myApplication(jobId), application)
      invalidateAfterApplicationChange(queryClient, jobId)
      toast.success('Application withdrawn')
    },
    onError: (err) => toast.error(jobErrorMessage(err)),
  })
}

interface DecideVariables {
  applicationId: number
  status: Extract<JobApplicationStatus, 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'>
  reason?: string
}

/** Owner/ADMIN deciding on one applicant — Review, Shortlist, Reject or Hire, with an optional reason. */
export function useDecideJobApplication(jobId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, status, reason }: DecideVariables) =>
      jobApplicationApi.decide(applicationId, status, reason),
    onSuccess: () => {
      invalidateAfterApplicationChange(queryClient, jobId)
      toast.success('Application updated')
    },
    onError: (err) => toast.error(jobErrorMessage(err)),
  })
}
