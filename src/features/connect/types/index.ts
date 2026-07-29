import type { UserRole } from '../../identity/types/auth'

/**
 * Mirrors the backend `UserSummaryResponse`. `isFollowing` is relative to the requesting user
 * and is resolved server-side for the whole page in one query, so a list can render correct
 * follow buttons without an extra request per row.
 */
export interface PersonSummary {
  id: number
  displayName: string
  email: string
  role: UserRole
  avatarUrl: string | null
  isFollowing: boolean
}

/** Mirrors the backend `FollowStatsResponse`. */
export interface FollowStats {
  followersCount: number
  followingCount: number
  isFollowing: boolean
}

/** Mirrors the backend `FollowToggleResponse`. */
export interface FollowToggleResult {
  following: boolean
  followersCount: number
}

export const connectKeys = {
  all: ['connect'] as const,
  recommendations: () => ['connect', 'recommendations'] as const,
  search: (q: string) => ['connect', 'search', q] as const,
  followers: (userId: number) => ['connect', 'followers', userId] as const,
  following: (userId: number) => ['connect', 'following', userId] as const,
  stats: (userId: number) => ['connect', 'stats', userId] as const,
}
