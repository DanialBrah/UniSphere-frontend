import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, PauseCircle, Pencil, PlayCircle, Trash2 } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { useChangeProjectStatus, useDeleteProject, useUpdateProject } from '../hooks/useProjectMutations'
import { allowedProjectStatusTargets, hasOtherMembers } from '../utils/permissions'
import type { ProjectResponse, ProjectStatus } from '../types'

const ACTION_BUTTON =
  'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:text-primary-50'
const DISABLED_BUTTON =
  'inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-400 opacity-60 dark:border-[#2D1F4D] dark:text-gray-500'

/** Copy for each transition the FSM allows. COMPLETED is terminal and irreversible, so it's the only destructive one. */
const ACTION_COPY: Record<ProjectStatus, { label: string; title: string; body: string; icon: typeof CheckCircle2 }> = {
  OPEN: {
    label: 'Mark as open',
    title: 'Reopen this project?',
    body: 'It returns to the actively-showcased state.',
    icon: PlayCircle,
  },
  IN_PROGRESS: {
    label: 'Mark in progress',
    title: 'Mark this project as in progress?',
    body: "Recruiting isn't affected — only the status changes.",
    icon: PauseCircle,
  },
  COMPLETED: {
    label: 'Mark as completed',
    title: 'Mark this project as completed?',
    body: 'Recruiting switches off automatically. This cannot be undone.',
    icon: CheckCircle2,
  },
}

/**
 * Owner/ADMIN controls: the status transitions the server will actually accept, the recruiting
 * toggle, plus edit and delete. Rendered only when `project.canModify` is true — that flag is
 * computed server-side from the same rule the API enforces, so it is the honest gate.
 */
export function ProjectStatusActions({ project }: Readonly<{ project: ProjectResponse }>) {
  const navigate = useNavigate()
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const changeStatus = useChangeProjectStatus(project.id)
  const updateProject = useUpdateProject(project.id)
  const deleteProject = useDeleteProject()

  const targets = allowedProjectStatusTargets(project.status)
  const blockedByMembers = hasOtherMembers(project)
  const recruitingLocked = project.status === 'COMPLETED'

  return (
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Manage this project</h2>

      <label
        className={`flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3.5 py-2.5 dark:border-[#2D1F4D] ${recruitingLocked ? 'opacity-50' : ''}`}
      >
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Recruiting
          <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">
            {recruitingLocked ? '— off, project completed' : '— accepting new applications'}
          </span>
        </span>
        <input
          type="checkbox"
          checked={project.isRecruiting}
          disabled={recruitingLocked || updateProject.isPending}
          onChange={(e) => updateProject.mutate({ isRecruiting: e.target.checked })}
          className="h-4 w-4 rounded accent-primary"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {targets.map((target) => {
          const { label, icon: Icon } = ACTION_COPY[target]
          return (
            <button key={target} onClick={() => setPendingStatus(target)} className={ACTION_BUTTON}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}

        <button onClick={() => navigate(`/projects/${project.id}/edit`)} className={ACTION_BUTTON}>
          <Pencil className="h-4 w-4" />
          Edit
        </button>

        <button
          onClick={() => !blockedByMembers && setConfirmDelete(true)}
          disabled={blockedByMembers}
          title={blockedByMembers ? 'Remove other members first, or mark it completed instead' : undefined}
          className={blockedByMembers ? DISABLED_BUTTON : `${ACTION_BUTTON} hover:!border-red-400 hover:!text-red-500`}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {blockedByMembers && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This project has other members — remove them or mark it completed instead of deleting it.
        </p>
      )}

      {pendingStatus && (
        <ConfirmModal
          title={ACTION_COPY[pendingStatus].title}
          body={ACTION_COPY[pendingStatus].body}
          confirmLabel={ACTION_COPY[pendingStatus].label}
          destructive={pendingStatus === 'COMPLETED'}
          isPending={changeStatus.isPending}
          onCancel={() => setPendingStatus(null)}
          onConfirm={() =>
            changeStatus.mutate({ status: pendingStatus }, { onSettled: () => setPendingStatus(null) })
          }
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete this project?"
          body="It disappears from the board straight away. This cannot be undone."
          confirmLabel="Delete"
          destructive
          isPending={deleteProject.isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            deleteProject.mutate(project.id, {
              onSuccess: () => navigate('/projects', { replace: true }),
              onError: () => setConfirmDelete(false),
            })
          }
        />
      )}
    </section>
  )
}
