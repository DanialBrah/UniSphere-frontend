import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { jobApi } from '../api/jobApi'
import { jobKeys } from '../types'
import type { JobFilters, JobStatus, JobSummaryResponse, JobType, SpringPage } from '../types'

/** Spring pages are 0-indexed and carry `last`, so this is the same for every list here. */
function nextPage<T>(lastPage: SpringPage<T>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/**
 * Résumé and company-logo URLs all arrive as presigned URLs that expire after about an hour, and
 * the global query config sets refetchOnWindowFocus: false. Without this override a tab left open
 * renders a dead download link with no way to recover; refetching on focus re-mints the URLs at
 * exactly the moment the user would otherwise notice. Same precedent as Events.
 */
export const PRESIGNED_URL_REFRESH = { refetchOnWindowFocus: true } as const

export function useJobFeed(filters: JobFilters, enabled = true) {
  return useInfiniteQuery({
    queryKey: jobKeys.list(filters),
    queryFn: ({ pageParam }) => jobApi.getFeed(filters, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<JobSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The FULLTEXT boolean operators JobService strips server-side before searching. */
const FULLTEXT_OPERATORS = /[+\-><()~*"@]/g

export function sanitizeJobQuery(q: string): string {
  return q.replace(FULLTEXT_OPERATORS, ' ').trim()
}

export const JOB_SEARCH_MIN_LENGTH = 3

/**
 * MySQL's innodb_ft_min_token_size defaults to 3 and applies per token, so a search is only worth
 * sending if some word survives sanitisation at three characters or more. `q` is also a required
 * param: omitting it binds to null and surfaces as a 500. Same gotcha as Events' search.
 */
export function isSearchableJobQuery(q: string): boolean {
  return sanitizeJobQuery(q)
    .split(/\s+/)
    .some((token) => token.length >= JOB_SEARCH_MIN_LENGTH)
}

export function useJobSearch(q: string, jobType: JobType | null) {
  const trimmed = q.trim()
  return useInfiniteQuery({
    queryKey: jobKeys.search(trimmed, jobType ?? 'ALL'),
    queryFn: ({ pageParam }) => jobApi.search(trimmed, jobType, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<JobSummaryResponse>) => nextPage(lastPage),
    enabled: isSearchableJobQuery(q),
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The caller's own postings, every status including DRAFT. */
export function useMyJobs(status: JobStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: jobKeys.mine(status ?? 'ALL'),
    queryFn: ({ pageParam }) => jobApi.getMyJobs(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<JobSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useJob(jobId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => jobApi.getJob(jobId),
    enabled: options?.enabled ?? jobId > 0,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** Owner/ADMIN only — the server 403s everyone else, so gate `enabled` on `job.canModify`. */
export function useJobStats(jobId: number, enabled: boolean) {
  return useQuery({
    queryKey: jobKeys.stats(jobId),
    queryFn: () => jobApi.getStats(jobId),
    enabled: enabled && jobId > 0,
  })
}
