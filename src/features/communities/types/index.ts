import type { ApiResponse, UserRole } from '../../identity/types/auth'
import type { SpringPage } from '../../social/types'

export type { ApiResponse, UserRole, SpringPage }

export type CommunityVisibility = 'PUBLIC' | 'UNIVERSITY_ONLY' | 'PRIVATE'
export type CommunityMemberRole = 'ADMIN' | 'MODERATOR' | 'MEMBER'
export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface CommunityResponse {
  id: number
  createdBy: number
  creatorName: string
  creatorAvatarUrl: string | null
  name: string
  description: string | null
  bannerUrl: string | null
  visibility: CommunityVisibility
  universityId: number | null
  memberCount: number
  /** The caller's own role, or null if they are not a member. */
  viewerRole: CommunityMemberRole | null
  /** Whether the caller has a PENDING join request on this (PRIVATE) community. */
  hasPendingJoinRequest: boolean
  createdAt: string
  updatedAt: string
}

export interface CommunityMemberResponse {
  userId: number
  displayName: string
  avatarUrl: string | null
  role: CommunityMemberRole
  joinedAt: string
}

export interface CommunityBanResponse {
  userId: number
  displayName: string
  avatarUrl: string | null
  bannedBy: number
  reason: string | null
  bannedAt: string
}

export interface CommunityJoinRequestResponse {
  id: number
  userId: number
  displayName: string
  avatarUrl: string | null
  status: JoinRequestStatus
  message: string | null
  reviewedBy: number | null
  reviewedAt: string | null
  createdAt: string
}

export interface CommunityAnnouncementResponse {
  id: number
  communityId: number
  authorId: number
  authorName: string
  authorAvatarUrl: string | null
  title: string
  content: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface ChatAccessResponse {
  conversationId: number
}

export interface CreateCommunityRequest {
  name: string
  description?: string
  visibility?: CommunityVisibility
  bannerKey?: string
  universityId?: number
}

export interface UpdateCommunityRequest {
  name?: string
  description?: string
  visibility?: CommunityVisibility
  bannerKey?: string
}

export interface ChangeRoleRequest {
  role: CommunityMemberRole
}

export interface CreateJoinRequestRequest {
  message?: string
}

export interface BanRequest {
  reason?: string
}

export interface CreateAnnouncementRequest {
  title: string
  content: string
}

export interface UpdateAnnouncementRequest {
  title?: string
  content?: string
}

export const communityKeys = {
  discoverInfinite: () => ['communities', 'discover', 'infinite'] as const,
  searchInfinite: (q: string) => ['communities', 'search', q, 'infinite'] as const,
  mineInfinite: () => ['communities', 'mine', 'infinite'] as const,
  detail: (id: number) => ['communities', id] as const,
  membersInfinite: (id: number) => ['communities', id, 'members', 'infinite'] as const,
  bansInfinite: (id: number) => ['communities', id, 'bans', 'infinite'] as const,
  joinRequestsInfinite: (id: number, status?: JoinRequestStatus) =>
    ['communities', id, 'join-requests', status ?? 'ALL', 'infinite'] as const,
  announcementsInfinite: (id: number) => ['communities', id, 'announcements', 'infinite'] as const,
  postsInfinite: (id: number) => ['communities', id, 'posts', 'infinite'] as const,
  chatAccess: (id: number) => ['communities', id, 'chat'] as const,
} as const
