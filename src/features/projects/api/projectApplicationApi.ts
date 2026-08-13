import api from '../../../lib/axios'
import type {
  ApiResponse,
  CreateProjectApplicationRequest,
  ProjectApplicationResponse,
  ProjectApplicationStatus,
  SpringPage,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

type QueryParams = Record<string, string | number>

/**
 * The roster nests under `/projects/{id}`; "my applications" (across every project) and the status
 * decision are flat, since an application id is globally unique — same nested-vs-flat split as Jobs.
 *
 * There is no DELETE — applications are a decision record. Self-withdrawal goes through `decide`
 * with `status: 'WITHDRAWN'`, same as the owner's ACCEPTED/REJECTED.
 */
export const projectApplicationApi = {
  /** STUDENT/ALUMNI only; project must be recruiting and the role open with free slots. */
  apply: (
    projectId: number,
    roleId: number,
    body: CreateProjectApplicationRequest,
  ): Promise<ProjectApplicationResponse> =>
    api
      .post<ApiResponse<ProjectApplicationResponse>>(`/projects/${projectId}/roles/${roleId}/applications`, body)
      .then(unwrap),

  /** Owner/ADMIN only — the applicant roster across every role on one project. */
  listRoster: (
    projectId: number,
    roleId: number | null,
    status: ProjectApplicationStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<ProjectApplicationResponse>> => {
    const params: QueryParams = { page, size }
    if (roleId != null) params.roleId = roleId
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<ProjectApplicationResponse>>>(`/projects/${projectId}/applications`, { params })
      .then(unwrapPage)
  },

  /** "My applications" — every application the caller has submitted, across every project. */
  listMyApplications: (
    status: ProjectApplicationStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<ProjectApplicationResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<ProjectApplicationResponse>>>('/projects/applications/me', { params })
      .then(unwrapPage)
  },

  /**
   * Dual actor: the applicant may only set WITHDRAWN, from PENDING; the project's owner/ADMIN may
   * set ACCEPTED/REJECTED, from PENDING. `reason` is the withdrawal note or the owner's decision note.
   */
  decide: (
    applicationId: number,
    status: ProjectApplicationStatus,
    reason?: string,
  ): Promise<ProjectApplicationResponse> =>
    api
      .patch<ApiResponse<ProjectApplicationResponse>>(`/projects/applications/${applicationId}`, {
        status,
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      })
      .then(unwrap),
}
