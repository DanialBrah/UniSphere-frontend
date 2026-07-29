import { Link } from 'react-router-dom'
import { useFollowStats } from '../hooks/useConnectPeople'
import { FollowButton } from './FollowButton'

interface Props {
  userId: number
  /** Own profile shows counts only — you can't follow yourself. */
  isOwnProfile?: boolean
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="text-sm text-gray-600 dark:text-gray-400">
      <span className="font-bold text-gray-900 dark:text-white">{value}</span>{' '}
      {label}
    </span>
  )
}

/**
 * Follower/following counts plus a follow button, fetched separately from the profile itself.
 * Kept off `UserProfileResponse` on purpose — that's a sealed interface with six MapStruct-mapped
 * records also used by the login/registration path, which has no use for follow data.
 */
export function FollowStatsBar({ userId, isOwnProfile = false }: Props) {
  const { data, isLoading } = useFollowStats(userId)

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-4 mt-3">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-[#2D1F4D] animate-pulse" />
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-[#2D1F4D] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 mt-3 flex-wrap">
      {isOwnProfile ? (
        <>
          <Link to="/connect" className="hover:underline">
            <Stat value={data.followersCount} label="followers" />
          </Link>
          <Link to="/connect" className="hover:underline">
            <Stat value={data.followingCount} label="following" />
          </Link>
        </>
      ) : (
        <>
          <Stat value={data.followersCount} label="followers" />
          <Stat value={data.followingCount} label="following" />
          <FollowButton userId={userId} isFollowing={data.isFollowing} size="md" />
        </>
      )}
    </div>
  )
}
