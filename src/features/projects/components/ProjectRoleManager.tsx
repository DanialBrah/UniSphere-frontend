import { useState } from 'react'
import { Pencil, Plus, Trash2, TriangleAlert, Users2 } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { ProjectRoleFormModal } from './ProjectRoleFormModal'
import { ProjectRoleStatusBadge } from './ProjectBadges'
import { ProjectErrorState, ProjectStateBlock } from './ProjectStateBlocks'
import { useProjectRoles } from '../hooks/useProjectQueries'
import { useDeleteProjectRole } from '../hooks/useProjectMutations'
import type { ProjectRoleResponse } from '../types'

/** Owner/ADMIN-only role editor — add, edit, and remove the open positions a project recruits for. */
export function ProjectRoleManager({ projectId }: Readonly<{ projectId: number }>) {
  const [formTarget, setFormTarget] = useState<ProjectRoleResponse | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectRoleResponse | null>(null)

  const query = useProjectRoles(projectId)
  const deleteRole = useDeleteProjectRole(projectId)
  const roles = query.data ?? []

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
          <Users2 className="h-4 w-4 text-primary" />
          Roles
        </h2>
        <button
          onClick={() => setFormTarget('new')}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-primary-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add role
        </button>
      </div>

      {query.isPending ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">Loading roles…</p>
      ) : query.isError ? (
        <ProjectErrorState icon={TriangleAlert} title="Couldn't load roles" error={query.error} onRetry={() => query.refetch()} />
      ) : roles.length === 0 ? (
        <ProjectStateBlock icon={Users2} title="No roles yet" hint="Add one so people know what to apply for." />
      ) : (
        <div className="space-y-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-[#2D1F4D] dark:bg-[#1A1226]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{role.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {role.filledCount}/{role.slots} filled
                </p>
              </div>
              <ProjectRoleStatusBadge status={role.status} />
              <button
                onClick={() => setFormTarget(role)}
                aria-label={`Edit ${role.title}`}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-gray-400"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeleteTarget(role)}
                aria-label={`Remove ${role.title}`}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-red-400 hover:text-red-500 dark:border-[#2D1F4D] dark:text-gray-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {formTarget && (
        <ProjectRoleFormModal
          projectId={projectId}
          existing={formTarget === 'new' ? undefined : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Remove "${deleteTarget.title}"?`}
          body="If this role has ever received an application, removal is blocked — close it instead."
          confirmLabel="Remove"
          destructive
          isPending={deleteRole.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() =>
            deleteRole.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
              onError: () => setDeleteTarget(null),
            })
          }
        />
      )}
    </section>
  )
}
