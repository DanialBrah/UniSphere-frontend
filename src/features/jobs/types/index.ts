import type { ApiResponse } from '../../identity/types/auth'
import type { SpringPage } from '../../social/types'

export type { ApiResponse, SpringPage }

// String-literal unions rather than TS enums — tsconfig sets `erasableSyntaxOnly`.
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'FREELANCE'
export type WorkMode = 'ON_SITE' | 'REMOTE' | 'HYBRID'
export type ExperienceLevel =
  | 'INTERNSHIP'
  | 'ENTRY_LEVEL'
  | 'MID_LEVEL'
  | 'SENIOR_LEVEL'
  | 'MANAGER'
  | 'EXECUTIVE'
export type JobApplicationMode = 'INTERNAL' | 'EXTERNAL'
export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FILLED'
export type JobApplicationStatus =
  | 'SUBMITTED'
  | 'REVIEWED'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'HIRED'
  | 'WITHDRAWN'

// ── Responses ────────────────────────────────────────────────────────────────

export interface JobEmployerResponse {
  employerId: number
  companyName: string
  /** Presigned GET URL — expires after ~60 minutes. Never persist it. */
  companyLogoUrl: string | null
  industry: string | null
  companySize: string | null
  websiteUrl: string | null
  companyVerified: boolean
}

/** Full detail view — `GET /jobs/{id}`. */
export interface JobResponse {
  id: number
  employer: JobEmployerResponse
  title: string
  description: string | null
  requirements: string | null
  jobType: JobType
  workMode: WorkMode
  experienceLevel: ExperienceLevel
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  applicationMode: JobApplicationMode
  externalApplyUrl: string | null
  applicationDeadline: string | null
  status: JobStatus
  applicationCount: number
  /** Null means visible to every university — an Employer/Admin poster has no affiliation of its own. */
  universityId: number | null
  /** The caller's own application status on this job, or null if they haven't applied. Saves a round trip. */
  viewerApplicationStatus: JobApplicationStatus | null
  /** Whether the caller may edit, change status or delete this posting. */
  canModify: boolean
  createdAt: string
  updatedAt: string
}

/** List/feed/search/me projection. Drops description and requirements. */
export interface JobSummaryResponse {
  id: number
  employer: JobEmployerResponse
  title: string
  jobType: JobType
  workMode: WorkMode
  experienceLevel: ExperienceLevel
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  applicationMode: JobApplicationMode
  status: JobStatus
  applicationDeadline: string | null
  universityId: number | null
  viewerApplicationStatus: JobApplicationStatus | null
  canModify: boolean
  createdAt: string
}

export interface JobApplicantResponse {
  id: number
  displayName: string
  /** Presigned GET URL — expires after ~60 minutes. */
  avatarUrl: string | null
  role: string
}

export interface JobApplicationResponse {
  id: number
  jobId: number
  /** May be null in edge cases (e.g. a title lookup miss). */
  jobTitle: string | null
  applicantId: number
  applicant: JobApplicantResponse
  /** Presigned GET URL resolved fresh from the bare resumeKey — never construct one client-side. */
  resumeUrl: string
  coverLetter: string | null
  status: JobApplicationStatus
  decisionReason: string | null
  withdrawnAt: string | null
  createdAt: string
}

/** Owner/ADMIN-only per-job breakdown — `GET /jobs/{id}/stats`. */
export interface JobStatsResponse {
  submitted: number
  reviewed: number
  shortlisted: number
  rejected: number
  hired: number
  withdrawn: number
  totalApplications: number
}

export interface JobMediaPresignResponse {
  uploadUrl: string
  mediaKey: string
}

export interface JobMediaUploadResponse {
  mediaKey: string
  mediaUrl: string
}

// ── Requests ─────────────────────────────────────────────────────────────────

export interface CreateJobRequest {
  title: string
  description?: string
  requirements?: string
  jobType?: JobType
  workMode?: WorkMode
  experienceLevel?: ExperienceLevel
  location?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  applicationMode?: JobApplicationMode
  externalApplyUrl?: string
  /** Must be a future date. */
  applicationDeadline?: string
  universityId?: number
}

/** PUT, but PATCH-like: an omitted field is untouched, a blank string clears a nullable text field. */
export interface UpdateJobRequest {
  title?: string
  description?: string
  requirements?: string
  jobType?: JobType
  workMode?: WorkMode
  experienceLevel?: ExperienceLevel
  location?: string
  salaryMin?: number
  salaryMax?: number
  /** True resets both salaryMin and salaryMax to unset. Ignored when either is also supplied. */
  clearSalary?: boolean
  salaryCurrency?: string
  applicationMode?: JobApplicationMode
  externalApplyUrl?: string
  applicationDeadline?: string
  /** True clears applicationDeadline. Ignored when applicationDeadline is also supplied. */
  clearApplicationDeadline?: boolean
  universityId?: number
  /** True clears universityId back to "every university". Ignored when universityId is also supplied. */
  clearUniversityId?: boolean
}

export interface JobStatusUpdateRequest {
  status: JobStatus
}

/** Dual-purpose: the applicant's own WITHDRAWN, or the employer/ADMIN's REVIEWED/SHORTLISTED/REJECTED/HIRED. */
export interface JobApplicationStatusUpdateRequest {
  status: JobApplicationStatus
  reason?: string
}

export interface CreateJobApplicationRequest {
  /** A mediaKey returned by the presign/upload endpoint, owned by the caller. */
  resumeKey: string
  coverLetter?: string
}

export interface JobMediaPresignRequest {
  filename: string
  /** Must match application/pdf | application/msword | .../wordprocessingml.document. */
  contentType: string
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface JobFilters {
  jobType: JobType | null
  workMode: WorkMode | null
  experienceLevel: ExperienceLevel | null
  universityId: number | null
  /** Never DRAFT — GET / 400s on status=DRAFT, and omitted defaults server-side to OPEN anyway. */
  status: Extract<JobStatus, 'OPEN' | 'CLOSED' | 'FILLED'> | null
}

export const EMPTY_JOB_FILTERS: JobFilters = {
  jobType: null,
  workMode: null,
  experienceLevel: null,
  universityId: null,
  status: null,
}

/** Staged for upload at Easy Apply submit time — a résumé has nothing to preview inline. */
export interface PendingResume {
  file: File
}

// ── Query keys ───────────────────────────────────────────────────────────────

/**
 * Every level is a valid invalidation prefix, so `jobKeys.lists()` clears every filtered board at
 * once. Optional filter dimensions use the literal 'ALL' rather than undefined, which the query
 * hasher strips — `['jobs','mine',undefined]` and `['jobs','mine']` collide.
 */
export const jobKeys = {
  all: ['jobs'] as const,

  lists: () => ['jobs', 'list'] as const,
  list: (filters: JobFilters) => ['jobs', 'list', filters] as const,
  searches: () => ['jobs', 'search'] as const,
  search: (q: string, jobType: JobType | 'ALL') => ['jobs', 'search', q, jobType] as const,

  mineAll: () => ['jobs', 'mine'] as const,
  mine: (status: JobStatus | 'ALL') => ['jobs', 'mine', status] as const,

  details: () => ['jobs', 'detail'] as const,
  detail: (jobId: number) => ['jobs', 'detail', jobId] as const,
  stats: (jobId: number) => ['jobs', 'stats', jobId] as const,

  applicationsAll: () => ['jobs', 'applications'] as const,
  roster: (jobId: number, status: JobApplicationStatus | 'ALL') =>
    ['jobs', 'applications', 'roster', jobId, status] as const,
  rosterAll: (jobId: number) => ['jobs', 'applications', 'roster', jobId] as const,
  myApplication: (jobId: number) => ['jobs', 'applications', 'mine', jobId] as const,
  myApplicationsAll: () => ['jobs', 'applications', 'mine-all'] as const,
  myApplications: (status: JobApplicationStatus | 'ALL') =>
    ['jobs', 'applications', 'mine-all', status] as const,
} as const
