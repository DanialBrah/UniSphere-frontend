import { useState } from 'react'
import type { InfiniteData } from '@tanstack/react-query'
import { TriangleAlert, Users } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { ProjectMemberRow } from './ProjectMemberRow'
import { ProjectRosterRowSkeleton } from './ProjectSkeleton'
import { ProjectErrorState, ProjectStateBlock } from './ProjectStateBlocks'
import { useProjectMembers, useRemoveProjectMember } from '../hooks/useProjectMembers'
import { canRemoveMember } from '../utils/permissions'
import { useAuth } from '../../../hooks/useAuth'
import type { ProjectMemberResponse, ProjectResponse, SpringPage } from '../types'

const flatten = (
  data?: InfiniteData<SpringPage<ProjectMemberResponse>>,
): ProjectMemberResponse[] => data?.pages.flatMap((page) => page.content) ?? []

/** The project's team roster, with a remove action for the owner/ADMIN. */
export function ProjectMemberRoster({ project }: Readonly<{ project: ProjectResponse }>) {
  const { user } = useAuth()
  const [removeTarget, setRemoveTarget] = useState<ProjectMemberResponse | null>(null)

  const query = useProjectMembers(project.id)
  const removeMutation = useRemoveProjectMember(project.id)
  const members = flatten(query.data)

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        <Users className="h-4 w-4 text-primary" />
        Team ({project.memberCount})
      </h2>

      {renderBody()}

      {removeTarget && (
        <ConfirmModal
          title={`Remove ${removeTarget.displayName}?`}
          body="They lose access as a contributor, and their role slot reopens. This cannot be undone."
          confirmLabel="Remove"
          destructive
          isPending={removeMutation.isPending}
          onCancel={() => setRemoveTarget(null)}
          onConfirm={() =>
            removeMutation.mutate(removeTarget.userId, { onSettled: () => setRemoveTarget(null) })
          }
        />
      )}
    </section>
  )

  function renderBody() {
    if (query.isPending && query.fetchStatus !== 'idle') {
      return (
        <div className="space-y-2">
          <ProjectRosterRowSkeleton />
          <ProjectRosterRowSkeleton />
        </div>
      )
    }

    if (query.isError) {
      return (
        <ProjectErrorState
          icon={TriangleAlert}
          title="Couldn't load the team"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )
    }

    if (members.length === 0) {
      return <ProjectStateBlock icon={Users} title="No members yet" />
    }

    return (
      <>
        <div className="space-y-2">
          {members.map((member) => (
            <ProjectMemberRow
              key={member.userId}
              member={member}
              canRemove={canRemoveMember(user, project, member.userId)}
              isRemoving={removeMutation.isPending && removeMutation.variables === member.userId}
              onRemove={() => setRemoveTarget(member)}
            />
          ))}
        </div>

        {query.hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-[#2D1F4D] dark:text-primary-50"
            >
              {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </>
    )
  }
}
