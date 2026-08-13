import { useInfiniteQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectMemberApi } from '../api/projectMemberApi'
import { projectErrorMessage } from '../utils/projectErrors'
import { projectKeys } from '../types'
import type { ProjectMemberResponse, SpringPage } from '../types'

function nextPage(lastPage: SpringPage<ProjectMemberResponse>): number | undefined {
  return lastPage.last ? undefined : lastPage.number + 1
}

function invalidateAfterMembershipChange(queryClient: QueryClient, projectId: number) {
  queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) })
  queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
  queryClient.invalidateQueries({ queryKey: projectKeys.roles(projectId) })
  queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
  queryClient.invalidateQueries({ queryKey: projectKeys.joined() })
}

export function useProjectMembers(projectId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: ({ pageParam }) => projectMemberApi.listMembers(projectId, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: enabled && projectId > 0,
  })
}

/** A contributor leaving the project they joined — blocked server-side for the owner. */
export function useLeaveProject(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => projectMemberApi.leave(projectId),
    onSuccess: () => {
      invalidateAfterMembershipChange(queryClient, projectId)
      toast.success("You've left the project")
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}

/** Owner/ADMIN removing someone else. */
export function useRemoveProjectMember(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => projectMemberApi.removeMember(projectId, userId),
    onSuccess: () => {
      invalidateAfterMembershipChange(queryClient, projectId)
      toast.success('Member removed')
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}
