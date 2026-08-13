import api from '../../../lib/axios'
import type { ApiResponse, ProjectMemberResponse, SpringPage } from '../types'

const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

export const projectMemberApi = {
  listMembers: (projectId: number, page: number, size = 20): Promise<SpringPage<ProjectMemberResponse>> =>
    api
      .get<ApiResponse<SpringPage<ProjectMemberResponse>>>(`/projects/${projectId}/members`, {
        params: { page, size },
      })
      .then(unwrapPage),

  /** Leaving is blocked (400) for the owner — they must complete or delete the project instead. */
  leave: (projectId: number): Promise<void> =>
    api.delete<ApiResponse<null>>(`/projects/${projectId}/members/me`).then(() => undefined),

  /** Owner/ADMIN only. Never the owner's own row. */
  removeMember: (projectId: number, userId: number): Promise<void> =>
    api.delete<ApiResponse<null>>(`/projects/${projectId}/members/${userId}`).then(() => undefined),
}
