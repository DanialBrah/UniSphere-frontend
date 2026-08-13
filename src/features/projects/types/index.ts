import type { ApiResponse } from '../../identity/types/auth'
import type { SpringPage } from '../../social/types'

export type { ApiResponse, SpringPage }

// String-literal unions rather than TS enums — tsconfig sets `erasableSyntaxOnly`.
export type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
export type ProjectRoleStatus = 'OPEN' | 'CLOSED'
export type ProjectApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
export type ProjectMemberRole = 'OWNER' | 'CONTRIBUTOR'

// ── Responses ────────────────────────────────────────────────────────────────

/** Reused for a project's owner, an application's applicant, and a member roster row's user. */
export interface ProjectActorResponse {
  id: number
  displayName: string
  /** Presigned GET URL — expires after ~60 minutes. Never persist it. */
  avatarUrl: string | null
  /** Raw User.Role name, e.g. "STUDENT". */
  role: string
}

/** Full detail view — `GET /projects/{id}`. Roles are embedded inline; members are a separate paginated endpoint. */
export interface ProjectResponse {
  id: number
  owner: ProjectActorResponse
  title: string
  description: string | null
  coverImageUrl: string | null
  githubUrl: string | null
  demoUrl: string | null
  status: ProjectStatus
  isRecruiting: boolean
  universityId: number | null
  roles: ProjectRoleResponse[]
  memberCount: number
  /** Whether the caller may edit, change status, delete this project, or manage its roles/applications. */
  canModify: boolean
  createdAt: string
  updatedAt: string
}

/** List/feed/search/me/joined projection. Drops description and roles. */
export interface ProjectSummaryResponse {
  id: number
  owner: ProjectActorResponse
  title: string
  coverImageUrl: string | null
  status: ProjectStatus
  isRecruiting: boolean
  universityId: number | null
  memberCount: number
  openRolesCount: number
  canModify: boolean
  createdAt: string
}

export interface ProjectRoleResponse {
  id: number
  title: string
  description: string | null
  slots: number
  filledCount: number
  status: ProjectRoleStatus
}

export interface ProjectMemberResponse {
  userId: number
  displayName: string
  avatarUrl: string | null
  role: ProjectMemberRole
  /** Null for the owner's own row. */
  projectRoleId: number | null
  roleTitle: string | null
  joinedAt: string
}

export interface ProjectApplicationResponse {
  id: number
  projectId: number
  projectTitle: string | null
  projectRoleId: number
  roleTitle: string | null
  applicantId: number
  applicant: ProjectActorResponse
  message: string | null
  status: ProjectApplicationStatus
  /** Overloaded: the owner's decision rationale OR the applicant's own withdrawal note. */
  decisionReason: string | null
  reviewedAt: string | null
  withdrawnAt: string | null
  createdAt: string
}

export interface ProjectMediaPresignResponse {
  uploadUrl: string
  mediaKey: string
}

export interface ProjectMediaUploadResponse {
  mediaKey: string
  mediaUrl: string
}

// ── Requests ─────────────────────────────────────────────────────────────────

/** Always created OPEN — showcase implies immediate visibility, unlike Jobs there is no DRAFT state. */
export interface CreateProjectRequest {
  title: string
  description?: string
  coverImageKey?: string
  githubUrl?: string
  demoUrl?: string
}

/** PUT, but PATCH-like: an omitted field is untouched, a blank string clears a nullable text field. */
export interface UpdateProjectRequest {
  title?: string
  description?: string
  coverImageKey?: string
  githubUrl?: string
  demoUrl?: string
  isRecruiting?: boolean
}

export interface ProjectStatusUpdateRequest {
  status: ProjectStatus
}

/** @param slots omitted means 1. */
export interface CreateProjectRoleRequest {
  title: string
  description?: string
  slots?: number
}

export interface UpdateProjectRoleRequest {
  title?: string
  description?: string
  slots?: number
  status?: ProjectRoleStatus
}

export interface CreateProjectApplicationRequest {
  /** Optional note to the project owner explaining why you'd be a good fit. */
  message?: string
}

/**
 * Dual-purpose: WITHDRAWN — only the applicant themselves, from PENDING; ACCEPTED/REJECTED — only
 * the project's owner or an admin.
 */
export interface ProjectApplicationStatusUpdateRequest {
  status: ProjectApplicationStatus
  reason?: string
}

export interface ProjectMediaPresignRequest {
  filename: string
  /** Must match image/jpeg | image/png | image/webp. */
  contentType: string
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface ProjectFilters {
  status: ProjectStatus | null
  recruiting: boolean | null
  universityId: number | null
  ownerId: number | null
}

export const EMPTY_PROJECT_FILTERS: ProjectFilters = {
  status: null,
  recruiting: null,
  universityId: null,
  ownerId: null,
}

/** Staged for upload at submit time — mirrors `PendingEventCover`. */
export interface PendingProjectCover {
  file: File
  previewUrl: string
}

// ── Query keys ───────────────────────────────────────────────────────────────

/**
 * Every level is a valid invalidation prefix, so `projectKeys.lists()` clears every filtered board
 * at once. Optional filter dimensions use the literal 'ALL' rather than undefined, which the query
 * hasher strips.
 */
export const projectKeys = {
  all: ['projects'] as const,

  lists: () => ['projects', 'list'] as const,
  list: (filters: ProjectFilters) => ['projects', 'list', filters] as const,
  searches: () => ['projects', 'search'] as const,
  search: (q: string) => ['projects', 'search', q] as const,

  mineAll: () => ['projects', 'mine'] as const,
  mine: (status: ProjectStatus | 'ALL') => ['projects', 'mine', status] as const,
  joined: () => ['projects', 'joined'] as const,

  details: () => ['projects', 'detail'] as const,
  detail: (projectId: number) => ['projects', 'detail', projectId] as const,

  roles: (projectId: number) => ['projects', 'detail', projectId, 'roles'] as const,

  membersAll: () => ['projects', 'members'] as const,
  members: (projectId: number) => ['projects', 'members', projectId] as const,

  applicationsAll: () => ['projects', 'applications'] as const,
  roster: (projectId: number, roleId: number | 'ALL', status: ProjectApplicationStatus | 'ALL') =>
    ['projects', 'applications', 'roster', projectId, roleId, status] as const,
  rosterAll: (projectId: number) => ['projects', 'applications', 'roster', projectId] as const,
  myApplicationsAll: () => ['projects', 'applications', 'mine-all'] as const,
  myApplications: (status: ProjectApplicationStatus | 'ALL') =>
    ['projects', 'applications', 'mine-all', status] as const,
} as const
