import api from '../../../lib/axios'
import type {
  ApiResponse,
  CreateJobApplicationRequest,
  JobApplicationResponse,
  JobApplicationStatus,
  SpringPage,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

type QueryParams = Record<string, string | number>

/**
 * The roster and the caller's own single-job application nest under `/jobs/{id}`; "my applications"
 * (across every job) and the status decision are flat, since an application id is globally unique —
 * the same nested-vs-flat split `eventRegistrationApi` draws.
 *
 * There is no DELETE — applications are a decision record. Self-withdrawal goes through `decide`
 * with `status: 'WITHDRAWN'`, same as an employer's REVIEWED/SHORTLISTED/REJECTED/HIRED.
 */
export const jobApplicationApi = {
  /** STUDENT/ALUMNI only; job must be OPEN + applicationMode INTERNAL. Rate-limited 10/min. */
  apply: (jobId: number, body: CreateJobApplicationRequest): Promise<JobApplicationResponse> =>
    api.post<ApiResponse<JobApplicationResponse>>(`/jobs/${jobId}/applications`, body).then(unwrap),

  /** Owner/ADMIN only — the applicant roster for one job. */
  listRoster: (
    jobId: number,
    status: JobApplicationStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<JobApplicationResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<JobApplicationResponse>>>(`/jobs/${jobId}/applications`, { params })
      .then(unwrapPage)
  },

  /** The caller's own application for one job, or a 404 if they have none. */
  getMyApplication: (jobId: number): Promise<JobApplicationResponse> =>
    api.get<ApiResponse<JobApplicationResponse>>(`/jobs/${jobId}/applications/me`).then(unwrap),

  /** "My applications" — every application the caller has submitted, across every job. */
  listMyApplications: (
    status: JobApplicationStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<JobApplicationResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<JobApplicationResponse>>>('/jobs/applications/me', { params })
      .then(unwrapPage)
  },

  /**
   * Dual actor: the applicant may only set WITHDRAWN; the owning employer/ADMIN may set
   * REVIEWED/SHORTLISTED/REJECTED/HIRED. `reason` is the withdrawal note or the employer's decision note.
   */
  decide: (applicationId: number, status: JobApplicationStatus, reason?: string): Promise<JobApplicationResponse> =>
    api
      .patch<ApiResponse<JobApplicationResponse>>(`/jobs/applications/${applicationId}`, {
        status,
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      })
      .then(unwrap),
}
