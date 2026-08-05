import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useUnbanMember } from '../hooks/useUnbanMember'
import type { CommunityBanResponse } from '../types'

export function BanRow({ communityId, ban }: { communityId: number; ban: CommunityBanResponse }) {
  const { mutate: unban, isPending } = useUnbanMember(communityId)
  const timestamp = formatDistanceToNow(new Date(ban.bannedAt), { addSuffix: true })

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#130D22] border border-gray-200 dark:border-[#2D1F4D]">
      {ban.avatarUrl ? (
        <img src={ban.avatarUrl} alt={ban.displayName} className="w-9 h-9 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">
            {ban.displayName.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{ban.displayName}</p>
        {ban.reason && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ban.reason}</p>}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Banned {timestamp}</p>
      </div>

      <button
        onClick={() => unban(ban.userId)}
        disabled={isPending}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-[#2D1F4D] text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary disabled:opacity-50 transition-colors"
      >
        {isPending && <Loader2 size={12} className="animate-spin" />}
        Unban
      </button>
    </div>
  )
}
