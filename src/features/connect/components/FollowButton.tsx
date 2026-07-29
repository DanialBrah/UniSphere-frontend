import { useState } from 'react'
import { Check, Loader2, UserPlus } from 'lucide-react'
import { useToggleFollow } from '../hooks/useToggleFollow'

interface Props {
  userId: number
  isFollowing: boolean
  size?: 'sm' | 'md'
}

export function FollowButton({ userId, isFollowing, size = 'sm' }: Props) {
  const { mutate, isPending } = useToggleFollow()
  const [hovered, setHovered] = useState(false)

  // Following + hover reads as "click to unfollow" — the standard affordance, since a button
  // that just says "Following" gives no hint that it's actionable.
  const label = isFollowing ? (hovered ? 'Unfollow' : 'Following') : 'Follow'

  const base =
    size === 'md'
      ? 'px-4 py-2 text-sm gap-2 rounded-xl'
      : 'px-3 py-1.5 text-xs gap-1.5 rounded-lg'

  const tone = isFollowing
    ? 'border border-gray-200 dark:border-[#2D1F4D] text-gray-700 dark:text-gray-300 hover:border-red-300 hover:text-red-500 dark:hover:border-red-900/50 dark:hover:text-red-400'
    : 'bg-primary-600 hover:bg-primary-700 text-white border border-transparent'

  return (
    <button
      type="button"
      onClick={() => mutate(userId)}
      disabled={isPending}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      className={`shrink-0 font-semibold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${base} ${tone}`}
    >
      {isPending ? (
        <Loader2 size={size === 'md' ? 15 : 13} className="animate-spin" />
      ) : isFollowing ? (
        <Check size={size === 'md' ? 15 : 13} />
      ) : (
        <UserPlus size={size === 'md' ? 15 : 13} />
      )}
      {label}
    </button>
  )
}
