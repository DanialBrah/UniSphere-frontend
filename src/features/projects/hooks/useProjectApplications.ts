import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectApplicationApi } from '../api/projectApplicationApi'
import { projectErrorMessage } from '../utils/projectErrors'
import { projectKeys } from '../types'
import type { CreateProjectApplicationRequest, ProjectApplicationResponse, ProjectApplicationStatus, SpringPage } from '../types'

function nextPage(lastPage: SpringPage<ProjectApplicationResponse>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

/** Apply/decide/withdraw all touch role capacity and membership, so every derived surface refreshes. */
function invalidateAfterApplicationChange(queryClient: QueryClient, projectId: number) {
  queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
  queryClient.invalidateQueries({ queryKey: projectKeys.roles(projectId) })
  queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) })
  queryClient.invalidateQueries({ queryKey: projectKeys.rosterAll(projectId) })
  queryClient.invalidateQueries({ queryKey: projectKeys.myApplicationsAll() })
  queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
  queryClient.invalidateQueries({ queryKey: projectKeys.joined() })
}

// ── Reads ────────────────────────────────────────────────────────────────────

/** Applicant roster across every role on one project. Owner/ADMIN only — gate `enabled` on `project.canModify`. */
export function useProjectApplicationRoster(
  projectId: number,
  roleId: number | null,
  status: ProjectApplicationStatus | null,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: projectKeys.roster(projectId, roleId ?? 'ALL', status ?? 'ALL'),
    queryFn: ({ pageParam }) => projectApplicationApi.listRoster(projectId, roleId, status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: enabled && projectId > 0,
  })
}

/** "My applications" across every project. */
export function useMyProjectApplications(status: ProjectApplicationStatus | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: projectKeys.myApplications(status ?? 'ALL'),
    queryFn: ({ pageParam }) => projectApplicationApi.listMyApplications(status, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
  })
}

/**
 * Unlike `JobResponse.viewerApplicationStatus`, a project has many roles and the viewer's status is
 * per-role, so there's no single flag on `ProjectResponse` to read. This fetches a single page of
 * the caller's own applications (a student realistically has a handful, not hundreds) and keys them
 * by role id for O(1) lookup from `ProjectRolesList`.
 */
export function useMyApplicationsForProject(projectId: number, enabled: boolean) {
  const query = useQuery({
    queryKey: [...projectKeys.myApplicationsAll(), 'byProject', projectId],
    queryFn: () => projectApplicationApi.listMyApplications(null, 0, 100),
    enabled: enabled && projectId > 0,
  })

  const byRoleId = new Map<number, ProjectApplicationResponse>()
  for (const application of query.data?.content ?? []) {
    if (application.projectId === projectId) byRoleId.set(application.projectRoleId, application)
  }

  return { ...query, byRoleId }
}

// ── Writes ───────────────────────────────────────────────────────────────────

interface ApplyVariables {
  projectId: number
  roleId: number
  body: CreateProjectApplicationRequest
}

export function useApplyToProjectRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, roleId, body }: ApplyVariables) =>
      projectApplicationApi.apply(projectId, roleId, body),
    onSuccess: (_application, variables) => {
      invalidateAfterApplicationChange(queryClient, variables.projectId)
      toast.success('Application submitted')
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}

/** The applicant withdrawing their own application — no reason UI, unlike an owner decision. */
export function useWithdrawProjectApplication(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: number) => projectApplicationApi.decide(applicationId, 'WITHDRAWN'),
    onSuccess: () => {
      invalidateAfterApplicationChange(queryClient, projectId)
      toast.success('Application withdrawn')
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}

interface DecideVariables {
  applicationId: number
  status: Extract<ProjectApplicationStatus, 'ACCEPTED' | 'REJECTED'>
  reason?: string
}

/** Owner/ADMIN deciding on one applicant — Accept or Reject, with an optional reason. */
export function useDecideProjectApplication(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicationId, status, reason }: DecideVariables) =>
      projectApplicationApi.decide(applicationId, status, reason),
    onSuccess: () => {
      invalidateAfterApplicationChange(queryClient, projectId)
      toast.success('Application updated')
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}
