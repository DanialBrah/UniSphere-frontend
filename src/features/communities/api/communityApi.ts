import api from '../../../lib/axios'
import type { CreatePostRequest, PostResponse } from '../../social/types'
import type {
  ApiResponse,
  SpringPage,
  CommunityResponse,
  CommunityMemberResponse,
  CommunityBanResponse,
  CommunityJoinRequestResponse,
  CommunityAnnouncementResponse,
  ChatAccessResponse,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  ChangeRoleRequest,
  CreateJoinRequestRequest,
  BanRequest,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  JoinRequestStatus,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

// Spring's Page<T> is nested at response.data.data (ApiResponse envelope → data field)
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

export const communityApi = {
  create: (body: CreateCommunityRequest) =>
    api.post<ApiResponse<CommunityResponse>>('/communities', body).then(unwrap),

  discover: (page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<CommunityResponse>>>('/communities', { params: { page, size } })
      .then(unwrapPage),

  search: (q: string, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<CommunityResponse>>>('/communities/search', {
        params: { q, page, size },
      })
      .then(unwrapPage),

  mine: (page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<CommunityResponse>>>('/communities/mine', {
        params: { page, size },
      })
      .then(unwrapPage),

  getById: (communityId: number) =>
    api.get<ApiResponse<CommunityResponse>>(`/communities/${communityId}`).then(unwrap),

  update: (communityId: number, body: UpdateCommunityRequest) =>
    api.put<ApiResponse<CommunityResponse>>(`/communities/${communityId}`, body).then(unwrap),

  remove: (communityId: number) =>
    api.delete<ApiResponse<null>>(`/communities/${communityId}`).then(() => undefined),

  getChatAccess: (communityId: number) =>
    api.get<ApiResponse<ChatAccessResponse>>(`/communities/${communityId}/chat`).then(unwrap),

  getMembers: (communityId: number, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<CommunityMemberResponse>>>(
        `/communities/${communityId}/members`,
        { params: { page, size } },
      )
      .then(unwrapPage),

  joinSelf: (communityId: number) =>
    api
      .post<ApiResponse<CommunityMemberResponse>>(`/communities/${communityId}/members`)
      .then(unwrap),

  leave: (communityId: number) =>
    api.delete<ApiResponse<null>>(`/communities/${communityId}/members/me`).then(() => undefined),

  changeRole: (communityId: number, userId: number, body: ChangeRoleRequest) =>
    api
      .put<ApiResponse<CommunityMemberResponse>>(
        `/communities/${communityId}/members/${userId}/role`,
        body,
      )
      .then(unwrap),

  kickMember: (communityId: number, userId: number) =>
    api
      .delete<ApiResponse<null>>(`/communities/${communityId}/members/${userId}`)
      .then(() => undefined),

  createJoinRequest: (communityId: number, body: CreateJoinRequestRequest) =>
    api
      .post<ApiResponse<CommunityJoinRequestResponse>>(
        `/communities/${communityId}/join-requests`,
        body,
      )
      .then(unwrap),

  getJoinRequests: (
    communityId: number,
    status: JoinRequestStatus | undefined,
    page: number,
    size = 20,
  ) =>
    api
      .get<ApiResponse<SpringPage<CommunityJoinRequestResponse>>>(
        `/communities/${communityId}/join-requests`,
        { params: { status, page, size } },
      )
      .then(unwrapPage),

  approveJoinRequest: (communityId: number, requestId: number) =>
    api
      .post<ApiResponse<CommunityJoinRequestResponse>>(
        `/communities/${communityId}/join-requests/${requestId}/approve`,
      )
      .then(unwrap),

  rejectJoinRequest: (communityId: number, requestId: number) =>
    api
      .post<ApiResponse<CommunityJoinRequestResponse>>(
        `/communities/${communityId}/join-requests/${requestId}/reject`,
      )
      .then(unwrap),

  getBans: (communityId: number, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<CommunityBanResponse>>>(`/communities/${communityId}/bans`, {
        params: { page, size },
      })
      .then(unwrapPage),

  banMember: (communityId: number, userId: number, body: BanRequest) =>
    api
      .post<ApiResponse<CommunityBanResponse>>(`/communities/${communityId}/bans/${userId}`, body)
      .then(unwrap),

  unbanMember: (communityId: number, userId: number) =>
    api
      .delete<ApiResponse<null>>(`/communities/${communityId}/bans/${userId}`)
      .then(() => undefined),

  getAnnouncements: (communityId: number, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<CommunityAnnouncementResponse>>>(
        `/communities/${communityId}/announcements`,
        { params: { page, size } },
      )
      .then(unwrapPage),

  createAnnouncement: (communityId: number, body: CreateAnnouncementRequest) =>
    api
      .post<ApiResponse<CommunityAnnouncementResponse>>(
        `/communities/${communityId}/announcements`,
        body,
      )
      .then(unwrap),

  updateAnnouncement: (communityId: number, announcementId: number, body: UpdateAnnouncementRequest) =>
    api
      .put<ApiResponse<CommunityAnnouncementResponse>>(
        `/communities/${communityId}/announcements/${announcementId}`,
        body,
      )
      .then(unwrap),

  deleteAnnouncement: (communityId: number, announcementId: number) =>
    api
      .delete<ApiResponse<null>>(`/communities/${communityId}/announcements/${announcementId}`)
      .then(() => undefined),

  getPosts: (communityId: number, page: number, size = 20) =>
    api
      .get<ApiResponse<SpringPage<PostResponse>>>(`/communities/${communityId}/posts`, {
        params: { page, size },
      })
      .then(unwrapPage),

  createPost: (communityId: number, body: CreatePostRequest) =>
    api.post<ApiResponse<PostResponse>>(`/communities/${communityId}/posts`, body).then(unwrap),

  deletePost: (communityId: number, postId: number) =>
    api
      .delete<ApiResponse<null>>(`/communities/${communityId}/posts/${postId}`)
      .then(() => undefined),
}
