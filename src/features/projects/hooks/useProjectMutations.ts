import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectApi } from '../api/projectApi'
import { projectErrorMessage } from '../utils/projectErrors'
import { PROJECT_STATUS_LABEL } from '../utils/display'
import { projectKeys } from '../types'
import type {
  CreateProjectRequest,
  CreateProjectRoleRequest,
  ProjectResponse,
  ProjectStatusUpdateRequest,
  UpdateProjectRequest,
  UpdateProjectRoleRequest,
} from '../types'

/** Every list surface that could contain the changed project. */
function invalidateProjectLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
  queryClient.invalidateQueries({ queryKey: projectKeys.searches() })
  queryClient.invalidateQueries({ queryKey: projectKeys.mineAll() })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateProjectRequest) => projectApi.create(body),
    onSuccess: (project: ProjectResponse) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project)
      invalidateProjectLists(queryClient)
      toast.success('Project created')
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}

export function useUpdateProject(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateProjectRequest) => projectApi.update(projectId, body),
    onSuccess: (project: ProjectResponse) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project)
      invalidateProjectLists(queryClient)
      toast.success('Project updated')
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}

export function useChangeProjectStatus(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: ProjectStatusUpdateRequest) => projectApi.changeStatus(projectId, body),
    onSuccess: (project: ProjectResponse) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project)
      invalidateProjectLists(queryClient)
      toast.success(`Project ${PROJECT_STATUS_LABEL[project.status].toLowerCase()}`)
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: number) => projectApi.remove(projectId),
    onSuccess: (_data, projectId) => {
      // Removed rather than invalidated: the row is soft-deleted server-side, so a refetch of this
      // key would 404 and leave an error state cached behind the redirect.
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) })
      queryClient.removeQueries({ queryKey: projectKeys.rosterAll(projectId) })
      queryClient.removeQueries({ queryKey: projectKeys.members(projectId) })
      invalidateProjectLists(queryClient)
      toast.success('Project deleted')
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}

// ── Roles ────────────────────────────────────────────────────────────────────

export function useAddProjectRole(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateProjectRoleRequest) => projectApi.addRole(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.roles(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
      invalidateProjectLists(queryClient)
      toast.success('Role added')
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}

export function useUpdateProjectRole(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, body }: { roleId: number; body: UpdateProjectRoleRequest }) =>
      projectApi.updateRole(projectId, roleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.roles(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
      invalidateProjectLists(queryClient)
      toast.success('Role updated')
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}

export function useDeleteProjectRole(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roleId: number) => projectApi.removeRole(projectId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.roles(projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
      invalidateProjectLists(queryClient)
      toast.success('Role removed')
    },
    onError: (err) => toast.error(projectErrorMessage(err)),
  })
}
