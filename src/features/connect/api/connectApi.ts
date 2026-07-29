import api from '../../../lib/axios'
import type { ApiResponse } from '../../identity/types/auth'
import type { SpringPage } from '../../social/types'
import type { FollowStats, FollowToggleResult, PersonSummary } from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

export const connectApi = {
  /** People you may know — friends-of-friends first, then same-university backfill. */
  getRecommendations: (limit = 12): Promise<PersonSummary[]> =>
    api
      .get<ApiResponse<PersonSummary[]>>('/users/recommendations', { params: { limit } })
      .then(unwrap),

  searchPeople: (q: string, page = 0, size = 20): Promise<SpringPage<PersonSummary>> =>
    api
      .get<ApiResponse<SpringPage<PersonSummary>>>('/users/search', { params: { q, page, size } })
      .then(unwrap),

  getFollowers: (userId: number, page = 0, size = 20): Promise<SpringPage<PersonSummary>> =>
    api
      .get<ApiResponse<SpringPage<PersonSummary>>>(`/users/${userId}/followers`, {
        params: { page, size },
      })
      .then(unwrap),

  getFollowing: (userId: number, page = 0, size = 20): Promise<SpringPage<PersonSummary>> =>
    api
      .get<ApiResponse<SpringPage<PersonSummary>>>(`/users/${userId}/following`, {
        params: { page, size },
      })
      .then(unwrap),

  getFollowStats: (userId: number): Promise<FollowStats> =>
    api.get<ApiResponse<FollowStats>>(`/users/${userId}/follow-stats`).then(unwrap),

  /** Toggles: follows if not following, unfollows if already following. */
  toggleFollow: (userId: number): Promise<FollowToggleResult> =>
    api.post<ApiResponse<FollowToggleResult>>(`/users/${userId}/follow`).then(unwrap),
}
