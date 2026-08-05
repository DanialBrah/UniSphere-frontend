import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RoleBadge } from '../../social/components/RoleBadge'
import { formatNewsRelative } from '../utils/dateUtils'
import type { NewsAuthorResponse } from '../types'

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface Props {
  author: NewsAuthorResponse
  /** Falls back to createdAt at the call site — drafts have no publishedAt. */
  timestamp: string | null
  size?: 'sm' | 'md'
}

export function NewsAuthorLine({ author, timestamp, size = 'sm' }: Props) {
  // Avatars are presigned URLs with a ~60 minute lifetime, so a long-lived tab will eventually
  // 403 on the image. Falling back to initials keeps that from rendering as a broken icon.
  const [avatarFailed, setAvatarFailed] = useState(false)

  const avatarSize = size === 'md' ? 'w-10 h-10' : 'w-8 h-8'
  const textSize = size === 'md' ? 'text-sm' : 'text-xs'

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {author.avatarUrl && !avatarFailed ? (
        <img
          src={author.avatarUrl}
          alt={author.displayName}
          onError={() => setAvatarFailed(true)}
          className={`${avatarSize} rounded-full object-cover flex-shrink-0`}
        />
      ) : (
        <div
          className={`${avatarSize} rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-white text-[11px] font-bold">
            {initialsOf(author.displayName)}
          </span>
        </div>
      )}

      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/profile/${author.id}`}
            className={`${textSize} font-semibold text-gray-900 dark:text-white truncate hover:text-primary transition-colors`}
          >
            {author.displayName}
          </Link>
          <RoleBadge role={author.role} />
        </div>
        {timestamp && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {formatNewsRelative(timestamp)}
          </p>
        )}
      </div>
    </div>
  )
}
