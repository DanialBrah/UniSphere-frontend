import { Link } from 'react-router-dom'
import { RoleBadge } from '../../social/components/RoleBadge'
import { FollowButton } from './FollowButton'
import type { PersonSummary } from '../types'

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function PersonCard({ person }: { person: PersonSummary }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#130D22] border border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 transition-colors">
      <Link to={`/profile/${person.id}`} className="shrink-0">
        {person.avatarUrl ? (
          <img
            src={person.avatarUrl}
            alt={person.displayName}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{initialsOf(person.displayName)}</span>
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${person.id}`}
          className="flex items-center gap-1.5 min-w-0 hover:underline"
        >
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {person.displayName}
          </span>
          <RoleBadge role={person.role} />
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{person.email}</p>
      </div>

      <FollowButton userId={person.id} isFollowing={person.isFollowing} />
    </div>
  )
}
