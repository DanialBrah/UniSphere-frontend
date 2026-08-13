import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { projectApi } from '../api/projectApi'
import { projectKeys } from '../types'
import type { ProjectFilters, ProjectStatus, ProjectSummaryResponse, SpringPage } from '../types'

/** Spring pages are 0-indexed and carry `last`, so this is the same for every list here. */
function nextPage<T>(lastPage: SpringPage<T>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/**
 * Cover-image and avatar URLs all arrive as presigned URLs that expire after about an hour, and the
 * global query config sets refetchOnWindowFocus: false. Without this override a tab left open
 * renders a dead image with no way to recover; refetching on focus re-mints the URLs at exactly the
 * moment the user would otherwise notice. Same precedent as Jobs/Events.
 */
export const PRESIGNED_URL_REFRESH = { refetchOnWindowFocus: true } as const

export function useProjectFeed(filters: ProjectFilters, enabled = true) {
  return useInfiniteQuery({
    queryKey: projectKeys.list(filters),
    queryFn: ({ pageParam }) => projectApi.getFeed(filters, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<ProjectSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The FULLTEXT boolean operators the backend strips server-side before searching. */
const FULLTEXT_OPERATORS = /[+\-><()~*"@]/g

export function sanitizeProjectQuery(q: string): string {
  return q.replace(FULLTEXT_OPERATORS, ' ').trim()
}

export const PROJECT_SEARCH_MIN_LENGTH = 3

/** MySQL's innodb_ft_min_token_size defaults to 3 and applies per token. `q` is also a required param. */
export function isSearchableProjectQuery(q: string): boolean {
  return sanitizeProjectQuery(q)
    .split(/\s+/)
    .some((token) => token.length >= PROJECT_SEARCH_MIN_LENGTH)
}

export function useProjectSearch(q: string) {
  const trimmed = q.trim()
  return useInfiniteQuery({
    queryKey: projectKeys.search(trimmed),
    queryFn: ({ pageParam }) => projectApi.search(trimmed, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<ProjectSummaryResponse>) => nextPage(lastPage),
    enabled: isSearchableProjectQuery(q),
    ...PRESIGNED_URL_REFRESH,
  })
}

/** The caller's own projects, every status. */
export function useMyProjects(status: ProjectStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: projectKeys.mine(status ?? 'ALL'),
    queryFn: ({ pageParam }) => projectApi.getMyProjects(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<ProjectSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** Projects the caller has joined as a contributor (not owner). */
export function useJoinedProjects(enabled = true) {
  return useInfiniteQuery({
    queryKey: projectKeys.joined(),
    queryFn: ({ pageParam }) => projectApi.getJoinedProjects(pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: SpringPage<ProjectSummaryResponse>) => nextPage(lastPage),
    enabled,
    ...PRESIGNED_URL_REFRESH,
  })
}

export function useProject(projectId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectApi.getProject(projectId),
    enabled: options?.enabled ?? projectId > 0,
    ...PRESIGNED_URL_REFRESH,
  })
}

/** Not paginated server-side — a project's role list is small and bounded. */
export function useProjectRoles(projectId: number, enabled = true) {
  return useQuery({
    queryKey: projectKeys.roles(projectId),
    queryFn: () => projectApi.listRoles(projectId),
    enabled: enabled && projectId > 0,
  })
}
