import api from '../../../lib/axios'
import type {
  ApiResponse,
  CreateProjectRequest,
  CreateProjectRoleRequest,
  ProjectFilters,
  ProjectResponse,
  ProjectRoleResponse,
  ProjectStatus,
  ProjectStatusUpdateRequest,
  ProjectSummaryResponse,
  SpringPage,
  UpdateProjectRequest,
  UpdateProjectRoleRequest,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

type QueryParams = Record<string, string | number | boolean>

/**
 * Params are built by omission, never by assignment of a null.
 *
 * axios drops an `undefined` value but serialises `null` as the literal string "null", which Spring
 * then fails to bind to an enum — surfacing as a 500 rather than a 400. Same rule as jobApi/eventApi.
 */
function feedParams(filters: ProjectFilters, page: number, size: number): QueryParams {
  const params: QueryParams = { page, size }
  if (filters.status) params.status = filters.status
  if (filters.recruiting != null) params.recruiting = filters.recruiting
  if (filters.universityId != null) params.universityId = filters.universityId
  if (filters.ownerId != null) params.ownerId = filters.ownerId
  return params
}

export const projectApi = {
  create: (body: CreateProjectRequest): Promise<ProjectResponse> =>
    api.post<ApiResponse<ProjectResponse>>('/projects', body).then(unwrap),

  getFeed: (filters: ProjectFilters, page: number, size = 20): Promise<SpringPage<ProjectSummaryResponse>> =>
    api
      .get<ApiResponse<SpringPage<ProjectSummaryResponse>>>('/projects', { params: feedParams(filters, page, size) })
      .then(unwrapPage),

  /** `q` is required — the server has no "match everything" branch. */
  search: (q: string, page: number, size = 20): Promise<SpringPage<ProjectSummaryResponse>> =>
    api
      .get<ApiResponse<SpringPage<ProjectSummaryResponse>>>('/projects/search', { params: { q, page, size } })
      .then(unwrapPage),

  /** The caller's own projects, every status. */
  getMyProjects: (status: ProjectStatus | null, page: number, size = 20): Promise<SpringPage<ProjectSummaryResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api.get<ApiResponse<SpringPage<ProjectSummaryResponse>>>('/projects/me', { params }).then(unwrapPage)
  },

  /** Projects the caller has joined as a contributor (not owner). */
  getJoinedProjects: (page: number, size = 20): Promise<SpringPage<ProjectSummaryResponse>> =>
    api
      .get<ApiResponse<SpringPage<ProjectSummaryResponse>>>('/projects/joined', { params: { page, size } })
      .then(unwrapPage),

  getProject: (projectId: number): Promise<ProjectResponse> =>
    api.get<ApiResponse<ProjectResponse>>(`/projects/${projectId}`).then(unwrap),

  update: (projectId: number, body: UpdateProjectRequest): Promise<ProjectResponse> =>
    api.put<ApiResponse<ProjectResponse>>(`/projects/${projectId}`, body).then(unwrap),

  /** OPEN<->IN_PROGRESS, both ->COMPLETED; COMPLETED is terminal. */
  changeStatus: (projectId: number, body: ProjectStatusUpdateRequest): Promise<ProjectResponse> =>
    api.patch<ApiResponse<ProjectResponse>>(`/projects/${projectId}/status`, body).then(unwrap),

  /** Soft delete. Blocked (400) once the project has other members. */
  remove: (projectId: number): Promise<void> =>
    api.delete<ApiResponse<null>>(`/projects/${projectId}`).then(() => undefined),

  // ── Roles ──────────────────────────────────────────────────────────────────

  addRole: (projectId: number, body: CreateProjectRoleRequest): Promise<ProjectRoleResponse> =>
    api.post<ApiResponse<ProjectRoleResponse>>(`/projects/${projectId}/roles`, body).then(unwrap),

  /** Not paginated — a project's role list is small and bounded. */
  listRoles: (projectId: number): Promise<ProjectRoleResponse[]> =>
    api.get<ApiResponse<ProjectRoleResponse[]>>(`/projects/${projectId}/roles`).then(unwrap),

  updateRole: (projectId: number, roleId: number, body: UpdateProjectRoleRequest): Promise<ProjectRoleResponse> =>
    api.put<ApiResponse<ProjectRoleResponse>>(`/projects/${projectId}/roles/${roleId}`, body).then(unwrap),

  /** Blocked (400) once the role has ever received an application — close it instead. */
  removeRole: (projectId: number, roleId: number): Promise<void> =>
    api.delete<ApiResponse<null>>(`/projects/${projectId}/roles/${roleId}`).then(() => undefined),
}
