import { Link } from 'react-router-dom'
import { Crown, UserMinus } from 'lucide-react'
import { getInitials } from '../../../lib/userDisplay'
import { formatProjectDateTime } from '../utils/dateUtils'
import type { ProjectMemberResponse } from '../types'

interface ProjectMemberRowProps {
  member: ProjectMemberResponse
  canRemove: boolean
  onRemove: () => void
  isRemoving?: boolean
}

export function ProjectMemberRow({ member, canRemove, onRemove, isRemoving }: Readonly<ProjectMemberRowProps>) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-[#2D1F4D] dark:bg-[#1A1226]">
      <Link to={`/profile/${member.userId}`} className="shrink-0">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary dark:bg-primary/20">
            {getInitials(member.displayName)}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/profile/${member.userId}`}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-primary dark:text-white"
        >
          {member.displayName}
          {member.role === 'OWNER' && <Crown className="h-3.5 w-3.5 text-amber-500" />}
        </Link>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          {member.roleTitle ?? 'Owner'} · joined {formatProjectDateTime(member.joinedAt)}
        </p>
      </div>

      {canRemove && (
        <button
          onClick={onRemove}
          disabled={isRemoving}
          aria-label={`Remove ${member.displayName}`}
          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-red-400 hover:text-red-500 disabled:opacity-50 dark:border-[#2D1F4D] dark:text-gray-400"
        >
          <UserMinus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
