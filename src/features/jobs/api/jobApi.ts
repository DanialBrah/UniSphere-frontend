import api from '../../../lib/axios'
import type {
  ApiResponse,
  CreateJobRequest,
  JobFilters,
  JobResponse,
  JobStatsResponse,
  JobStatus,
  JobStatusUpdateRequest,
  JobSummaryResponse,
  JobType,
  SpringPage,
  UpdateJobRequest,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

type QueryParams = Record<string, string | number | boolean>

/**
 * Params are built by omission, never by assignment of a null.
 *
 * axios drops an `undefined` value but serialises `null` as the literal string "null", which Spring
 * then fails to bind to an enum — and because GlobalExceptionHandler doesn't extend
 * ResponseEntityExceptionHandler, that surfaces as a 500 rather than a 400. Same rule as eventApi.
 */
function feedParams(filters: JobFilters, page: number, size: number): QueryParams {
  const params: QueryParams = { page, size }
  if (filters.jobType) params.jobType = filters.jobType
  if (filters.workMode) params.workMode = filters.workMode
  if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel
  if (filters.universityId != null) params.universityId = filters.universityId
  if (filters.status) params.status = filters.status
  return params
}

export const jobApi = {
  create: (body: CreateJobRequest): Promise<JobResponse> =>
    api.post<ApiResponse<JobResponse>>('/jobs', body).then(unwrap),

  /** A null/omitted `status` defaults server-side to OPEN. `status=DRAFT` is rejected with a 400. */
  getFeed: (filters: JobFilters, page: number, size = 20): Promise<SpringPage<JobSummaryResponse>> =>
    api
      .get<ApiResponse<SpringPage<JobSummaryResponse>>>('/jobs', { params: feedParams(filters, page, size) })
      .then(unwrapPage),

  /** `q` is required — the server has no "match everything" branch. Always OPEN-only results. */
  search: (q: string, jobType: JobType | null, page: number, size = 20): Promise<SpringPage<JobSummaryResponse>> => {
    const params: QueryParams = { q, page, size }
    if (jobType) params.jobType = jobType
    return api.get<ApiResponse<SpringPage<JobSummaryResponse>>>('/jobs/search', { params }).then(unwrapPage)
  },

  /** The caller's own postings, every status including DRAFT. */
  getMyJobs: (status: JobStatus | null, page: number, size = 20): Promise<SpringPage<JobSummaryResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api.get<ApiResponse<SpringPage<JobSummaryResponse>>>('/jobs/me', { params }).then(unwrapPage)
  },

  /** A DRAFT is masked as 404 unless the caller is the poster or an ADMIN. */
  getJob: (jobId: number): Promise<JobResponse> =>
    api.get<ApiResponse<JobResponse>>(`/jobs/${jobId}`).then(unwrap),

  update: (jobId: number, body: UpdateJobRequest): Promise<JobResponse> =>
    api.put<ApiResponse<JobResponse>>(`/jobs/${jobId}`, body).then(unwrap),

  /** DRAFT->{OPEN,CLOSED}; OPEN->{CLOSED,FILLED}; CLOSED/FILLED are terminal. */
  changeStatus: (jobId: number, body: JobStatusUpdateRequest): Promise<JobResponse> =>
    api.patch<ApiResponse<JobResponse>>(`/jobs/${jobId}/status`, body).then(unwrap),

  /** Soft delete. Blocked (400) while applicationCount > 0. */
  remove: (jobId: number): Promise<void> =>
    api.delete<ApiResponse<null>>(`/jobs/${jobId}`).then(() => undefined),

  /** Owner/ADMIN only. */
  getStats: (jobId: number): Promise<JobStatsResponse> =>
    api.get<ApiResponse<JobStatsResponse>>(`/jobs/${jobId}/stats`).then(unwrap),
}
